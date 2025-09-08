get_player_earnings#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, contractclient, vec, Env, String, Vec, Address, BytesN, Bytes, token
};

// KALE Mining Contract Interface - Based on the actual contract code
#[contractclient(name = "KaleMiningClient")]
pub trait KaleMiningInterface {
    /// Plant/stake KALE tokens to start farming
    fn plant(env: Env, farmer: Address, amount: i128);
    
    /// Submit proof of work with hash and nonce
    fn work(env: Env, farmer: Address, hash: BytesN<32>, nonce: u64) -> u32;
    
    /// Harvest KALE rewards for a specific block index
    fn harvest(env: Env, farmer: Address, index: u32) -> i128;
}

#[derive(Clone)]
#[contracttype]
pub struct Circle {
    pub name: String,
    pub password_hash: BytesN<32>,
    pub betrayed: bool,
    pub creator: Address,
    pub member_count: u32,
    pub betrayer: Option<Address>, // Track who betrayed the circle
    pub total_kale_earned: i128,   // New: Total KALE earned by this circle
}

#[derive(Clone)]
#[contracttype]
pub struct CircleInfo {
    pub circle_id: u32,
    pub name: String,
    pub betrayed: bool,
    pub creator: Address,
    pub member_count: u32,
    pub total_kale_earned: i128, // New: Include earnings in circle info
}

#[derive(Clone)]
#[contracttype]
pub struct HarvestResult {
    pub total_distributed: i128,
    pub successful_circles: u32,
    pub failed_harvests: u32,
}

// New earnings tracking structures
#[derive(Clone)]
#[contracttype]
pub struct PlayerEarnings {
    pub address: Address,
    pub total_kale_earned: i128,
    pub kale_earned_from_own_circles: i128,
    pub kale_earned_from_join_circles: i128,
    pub kale_earned_from_betrayals: i128,
}

#[derive(Clone)]
#[contracttype]
pub struct CircleEarnings {
    pub circle_id: u32,
    pub total_earned: i128,
    pub total_harvests: u32,
    pub average_per_harvest: i128,
    pub last_harvest_amount: i128,
}

// Enhanced scoreboard structures
#[derive(Clone)]
#[contracttype]
pub struct PlayerStats {
    pub address: Address,
    pub circles_created: u32,
    pub circles_joined: u32,
    pub circles_betrayed: u32,
    pub times_betrayed: u32, // How many times this player's circles were betrayed
    pub total_kale_earned: i128, // New: Total KALE earned by this player
}

#[derive(Clone)]
#[contracttype]
pub struct ScoreboardEntry {
    pub address: Address,
    pub circles_created: u32,
    pub circles_joined: u32,
    pub circles_betrayed: u32,
    pub times_betrayed: u32,
    pub trust_score: i32, // Calculated score: circles_joined - circles_betrayed
    pub betrayal_ratio: u32, // Percentage: (circles_betrayed * 100) / circles_joined (0 if no circles joined)
    pub total_kale_earned: i128, // New: Total KALE earned
    pub kale_per_circle: i128, // New: Average KALE per circle joined
}

#[contract]
pub struct Contract;

// Storage keys
#[contracttype]
pub enum DataKey {
    Circle(u32),           // Circle ID -> Circle data
    WalletCircle(Address), // Wallet -> Circle ID they joined
    NextCircleId,          // Counter for circle IDs
    CreatedCircle(Address), // Creator Address -> Circle ID they created
    CircleMembers(u32),    // Circle ID -> Vec<Address> of all members
    AllCircleIds,          // Vec<u32> of all created circle IDs
    // Existing scoreboard keys
    PlayerStats(Address),  // Address -> PlayerStats
    AllPlayers,           // Vec<Address> of all players who have participated
    // New earnings tracking keys
    PlayerEarnings(Address), // Address -> PlayerEarnings
    CircleEarnings(u32),    // Circle ID -> CircleEarnings
    TotalKaleEarned,        // Global total KALE earned across all circles
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyCreatedCircle = 1,
    CircleDoesNotExist = 2,
    CircleBetrayed = 3,
    WrongPassword = 4,
    AlreadyInCircle = 5,
    LongPassword = 6,
    NotOwner = 7,
    HarvestFailed = 9,
    CannotJoinOwnCircle = 10,
    CannotBetrayOwnCircle = 11,
    TokenTransferFailed = 12,
    InvalidAmount = 13,
}

#[contractimpl]
impl Contract {
    pub fn create_circle(env: Env, creator: Address, name: String, password_hash: BytesN<32>) -> Result<u32, Error> {
        creator.require_auth();
        
        // Check if creator has already created a circle
        if env.storage().instance().has(&DataKey::CreatedCircle(creator.clone())) {
            return Err(Error::AlreadyCreatedCircle);
        }

        // Get next available circle ID
        let circle_id = Self::get_next_circle_id(&env);

        // Create the circle with earnings tracking
        let circle = Circle {
            name,
            password_hash,
            betrayed: false,
            creator: creator.clone(),
            member_count: 1,
            betrayer: None,
            total_kale_earned: 0, // Initialize earnings
        };
        
        // Store the circle
        env.storage().instance().set(&DataKey::Circle(circle_id), &circle);
        
        // Mark the creator as having created a circle
        env.storage().instance().set(&DataKey::CreatedCircle(creator.clone()), &circle_id);

        // Initialize empty members list for this circle
        let empty_members: Vec<Address> = vec![&env];
        env.storage().instance().set(&DataKey::CircleMembers(circle_id), &empty_members);

        // Add this circle ID to the list of all circles
        let mut all_circles: Vec<u32> = env.storage().instance().get(&DataKey::AllCircleIds).unwrap_or(vec![&env]);
        all_circles.push_back(circle_id);
        env.storage().instance().set(&DataKey::AllCircleIds, &all_circles);

        // Increment the circle ID counter
        env.storage().instance().set(&DataKey::NextCircleId, &(circle_id + 1));
        
        // Initialize circle earnings tracking
        let circle_earnings = CircleEarnings {
            circle_id,
            total_earned: 0,
            total_harvests: 0,
            average_per_harvest: 0,
            last_harvest_amount: 0,
        };
        env.storage().instance().set(&DataKey::CircleEarnings(circle_id), &circle_earnings);
        
        // Update scoreboard stats for creator
        Self::update_player_stats_created(&env, &creator);
        
        // Safely approve KALE for spending on circles with error handling
        match Self::safe_approve_kale(&env, &creator) {
            Ok(_) => {},
            Err(_) => {
                // If approval fails, we still return success for circle creation
                // but the user might need to manually approve later
            }
        }

        Ok(circle_id)
    }

    /// Join an existing circle with the correct password
    pub fn join_circle(env: Env, joiner: Address, circle_id: u32, password: String) -> Result<bool, Error> {
        joiner.require_auth();
        
        // Get the circle
        let circle_opt: Option<Circle> = env.storage().instance().get(&DataKey::Circle(circle_id));
        let mut circle = match circle_opt {
            Some(c) => c,
            None => return Err(Error::CircleDoesNotExist),
        };
        
        // Check if circle is betrayed
        if circle.betrayed {
            return Err(Error::CircleBetrayed);
        }
        
        // Prevent the owner/creator from joining their own circle
        if circle.creator == joiner {
            return Err(Error::CannotJoinOwnCircle);
        }
        
        // Verify password - clone the password_hash to avoid move
        Self::check_password(&env, password, circle.password_hash.clone())?;
        
        // Get current circles the joiner is in (as Vec<u32>)
        let mut current_circles: Vec<u32> = env.storage().instance().get(&DataKey::WalletCircle(joiner.clone())).unwrap_or(vec![&env]);
        
        // Check if already in this specific circle
        for existing_circle_id in current_circles.iter() {
            if existing_circle_id == circle_id {
                return Ok(true); // Already in this circle, return success
            }
        }
        
        // Get current members list and check if joiner is already in it (double-check)
        let mut members: Vec<Address> = env.storage().instance().get(&DataKey::CircleMembers(circle_id)).unwrap_or(vec![&env]);
        
        // Additional safety check: don't add if already in members list
        for existing_member in members.iter() {
            if existing_member == joiner {
                return Ok(true); // Already a member, just return success
            }
        }
        
        // Add joiner to this circle's member list
        members.push_back(joiner.clone());
        env.storage().instance().set(&DataKey::CircleMembers(circle_id), &members);
        
        // Increment member count safely
        circle.member_count = circle.member_count.saturating_add(1);
        env.storage().instance().set(&DataKey::Circle(circle_id), &circle);
        
        // Add this circle to the joiner's list of circles
        current_circles.push_back(circle_id);
        env.storage().instance().set(&DataKey::WalletCircle(joiner.clone()), &current_circles);
        
        // Update scoreboard stats for joiner
        Self::update_player_stats_joined(&env, &joiner);
        
        Ok(true)
    }

    /// Betray the circle the caller has joined
    pub fn betray_circle(env: Env, betrayer: Address, circle_id: u32, password: String) -> Result<bool, Error> {
        betrayer.require_auth();
        
        // Get the circle
        let circle_opt: Option<Circle> = env.storage().instance().get(&DataKey::Circle(circle_id));
        let mut circle = match circle_opt {
            Some(c) => c,
            None => return Err(Error::CircleDoesNotExist),
        };
        
        // Check if already betrayed
        if circle.betrayed {
            return Err(Error::CircleBetrayed);
        }
        
        // Prevent the owner/creator from betraying their own circle
        if circle.creator == betrayer {
            return Err(Error::NotOwner);
        }
        
        // Verify password - clone the password_hash to avoid move
        Self::check_password(&env, password, circle.password_hash.clone())?;

        // Mark circle as betrayed and record the betrayer
        circle.betrayed = true;
        circle.betrayer = Some(betrayer.clone());
        env.storage().instance().set(&DataKey::Circle(circle_id), &circle);

        // Update scoreboard stats
        Self::update_player_stats_betrayed(&env, &betrayer);
        Self::update_player_stats_was_betrayed(&env, &circle.creator);

        Ok(true)
    }

    /// Set a new password for a circle (only creator can do this)
    pub fn set_password(env: Env, caller: Address, circle_id: u32, password_hash: BytesN<32>) -> Result<bool, Error> {
        caller.require_auth();
        
        // Get the circle
        let mut circle: Circle = match env.storage().instance().get(&DataKey::Circle(circle_id)) {
            Some(c) => c,
            None => return Err(Error::CircleDoesNotExist),
        };
        
        // Check if caller is the creator
        if circle.creator != caller {
            return Err(Error::NotOwner);
        }
        
        // Check if circle is betrayed
        if circle.betrayed {
            return Err(Error::CircleBetrayed);
        }
        
        // Update password hash
        circle.password_hash = password_hash;
        env.storage().instance().set(&DataKey::Circle(circle_id), &circle);
        
        Ok(true)
    }

    /// Robust harvest and distribution with comprehensive error handling and earnings tracking
    pub fn harvest_and_distribute_all(env: Env, caller: Address, index: u32) -> HarvestResult {
        caller.require_auth();
        
        let mut total_distributed = 0i128;
        let mut successful_circles = 0u32;
        let mut failed_harvests = 0u32;
        
        // Get all circle IDs safely
        let all_circle_ids: Vec<u32> = env.storage().instance().get(&DataKey::AllCircleIds).unwrap_or(vec![&env]);
        
        // Process each circle with individual error handling
        for circle_id in all_circle_ids.iter() {
            let circle_id_val = circle_id.clone();
            
            // Safely get circle data
            let circle_opt: Option<Circle> = env.storage().instance().get(&DataKey::Circle(circle_id_val));
            
            let circle = match circle_opt {
                Some(c) => c,
                None => {
                    failed_harvests += 1;
                    continue; // Skip this circle if it doesn't exist
                }
            };
            
            // Skip if no members
            if circle.member_count == 0 {
                continue;
            }
            
            // Get all members of this circle safely
            let members: Vec<Address> = env.storage().instance().get(&DataKey::CircleMembers(circle_id_val)).unwrap_or(vec![&env]);
            
            if members.is_empty() {
                continue;
            }
            
            // Process this circle's harvest with error isolation
            match Self::process_circle_harvest(&env, &circle, &members, circle_id_val, index) {
                Ok(distributed_amount) => {
                    total_distributed += distributed_amount;
                    if distributed_amount > 0 {
                        successful_circles += 1;
                        // Update circle earnings tracking
                        Self::update_circle_earnings(&env, circle_id_val, distributed_amount);
                    }
                },
                Err(_) => {
                    failed_harvests += 1;
                    // Continue processing other circles even if this one fails
                }
            }
        }
        
        // Update global total earnings
        if total_distributed > 0 {
            let current_total: i128 = env.storage().instance().get(&DataKey::TotalKaleEarned).unwrap_or(0);
            env.storage().instance().set(&DataKey::TotalKaleEarned, &(current_total + total_distributed));
        }
        
        HarvestResult {
            total_distributed,
            successful_circles,
            failed_harvests,
        }
    }
    
    // Isolated circle processing function that handles its own errors and tracks earnings
    fn process_circle_harvest(env: &Env, circle: &Circle, members: &Vec<Address>, circle_id: u32, index: u32) -> Result<i128, Error> {
        let mut total_circle_harvest = 0i128;
        
        // Safe initialization of token clients
        let kale_client = match Self::get_kale_client(&env) {
            Ok(client) => client,
            Err(_) => return Err(Error::TokenTransferFailed),
        };
        
        let mining_client = match Self::get_mining_client(&env) {
            Ok(client) => client,
            Err(_) => return Err(Error::HarvestFailed),
        };
        
        // For each member, safely attempt harvest
        for member in members.iter() {
            match Self::safe_harvest_member(&env, &kale_client, &mining_client, member.clone(), index) {
                Ok(harvested_amount) => {
                    if harvested_amount > 0 {
                        // Safely transfer tokens to contract
                        match Self::safe_transfer_to_contract(&env, &kale_client, &member, harvested_amount) {
                            Ok(_) => {
                                total_circle_harvest += harvested_amount;
                            },
                            Err(_) => {
                                // Log the failure but continue with other members
                                continue;
                            }
                        }
                    }
                },
                Err(_) => {
                    // Individual member harvest failed, continue with others
                    continue;
                }
            }
        }
        
        // Distribute the pooled harvest if any was collected
        if total_circle_harvest > 0 {
            match Self::safe_distribute_pooled_harvest(&env, &circle, &members, total_circle_harvest) {
                Ok(distributed) => {
                    // Update circle's total earnings
                    let mut updated_circle = circle.clone();
                    updated_circle.total_kale_earned += distributed;
                    env.storage().instance().set(&DataKey::Circle(circle_id), &updated_circle);
                    
                    Ok(distributed)
                },
                Err(_) => Err(Error::TokenTransferFailed),
            }
        } else {
            Ok(0)
        }
    }
    
    // Safe member harvest function
    fn safe_harvest_member(env: &Env, kale_client: &token::Client, mining_client: &KaleMiningClient, member: Address, index: u32) -> Result<i128, Error> {
        // Get balance before harvest
        let balance_before = match Self::safe_get_balance(&kale_client, &member) {
            Ok(balance) => balance,
            Err(_) => return Err(Error::TokenTransferFailed),
        };
        
        // Attempt harvest with error handling
        match Self::try_harvest(&env, &mining_client, member.clone(), index) {
            Ok(_) => {
                // Get balance after harvest
                let balance_after = match Self::safe_get_balance(&kale_client, &member) {
                    Ok(balance) => balance,
                    Err(_) => return Err(Error::TokenTransferFailed),
                };
                
                let harvested = balance_after.saturating_sub(balance_before);
                Ok(harvested.max(0))
            },
            Err(_) => Err(Error::HarvestFailed),
        }
    }
    
    // Safe harvest attempt with comprehensive error handling
    fn try_harvest(_env: &Env, mining_client: &KaleMiningClient, farmer: Address, index: u32) -> Result<bool, Error> {
        // This is where the original crash would occur
        // We need to handle any potential panics or errors from the mining contract
        match mining_client.try_harvest(&farmer, &index) {
            Ok(_) => Ok(true),
            Err(_) => Err(Error::HarvestFailed),
        }
    }
    
    // Safe token balance check
    fn safe_get_balance(kale_client: &token::Client, address: &Address) -> Result<i128, Error> {
        kale_client
            .try_balance(&address)
            .map_err(|_| Error::TokenTransferFailed)?
            .map_err(|_| Error::TokenTransferFailed)
    }
    
    // Safe token transfer to contract
    fn safe_transfer_to_contract(env: &Env, kale_client: &token::Client, from: &Address, amount: i128) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        match kale_client.try_transfer(&from, &env.current_contract_address(), &amount) {
            Ok(_) => Ok(()),
            Err(_) => Err(Error::TokenTransferFailed),
        }
    }
    
    // Safe pooled harvest distribution with earnings tracking
    fn safe_distribute_pooled_harvest(env: &Env, circle: &Circle, members: &Vec<Address>, total_harvest: i128) -> Result<i128, Error> {
        if total_harvest <= 0 {
            return Ok(0);
        }
        
        let kale_client = match Self::get_kale_client(&env) {
            Ok(client) => client,
            Err(_) => return Err(Error::TokenTransferFailed),
        };
        
        if circle.betrayed {
            // If betrayed, all pooled rewards go to the betrayer
            if let Some(betrayer) = &circle.betrayer {
                match Self::safe_transfer_from_contract(&env, &kale_client, betrayer, total_harvest) {
                    Ok(_) => {
                        // Update betrayer's earnings
                        Self::update_player_earnings_betrayal(&env, betrayer, total_harvest);
                        return Ok(total_harvest);
                    },
                    Err(_) => return Err(Error::TokenTransferFailed),
                }
            }
        } else {
            // Distribute equally among all circle members
            let member_count = members.len() as i128;
            
            if member_count > 0 {
                let reward_per_member = total_harvest / member_count;
                let remainder = total_harvest % member_count;
                let mut distributed = 0i128;
                
                // Distribute base amount to all members
                for member in members.iter() {
                    if reward_per_member > 0 {
                        match Self::safe_transfer_from_contract(&env, &kale_client, &member, reward_per_member) {
                            Ok(_) => {
                                distributed += reward_per_member;
                                // Update member's earnings
                                if member == circle.creator {
                                    Self::update_player_earnings_own_circle(&env, &member, reward_per_member);
                                } else {
                                    Self::update_player_earnings_joined_circle(&env, &member, reward_per_member);
                                }
                            },
                            Err(_) => {
                                // Continue with other members even if one transfer fails
                                continue;
                            }
                        }
                    }
                }
                
                // Give remainder to the first member
                if remainder > 0 && !members.is_empty() {
                    let first_member = members.get(0).unwrap();
                    match Self::safe_transfer_from_contract(&env, &kale_client, &first_member, remainder) {
                        Ok(_) => {
                            distributed += remainder;
                            // Update first member's earnings
                            if first_member == circle.creator {
                                Self::update_player_earnings_own_circle(&env, &first_member, remainder);
                            } else {
                                Self::update_player_earnings_joined_circle(&env, &first_member, remainder);
                            }
                        },
                        Err(_) => {
                            // Remainder transfer failed, but we still distributed the base amounts
                        }
                    }
                }
                
                return Ok(distributed);
            }
        }
        
        Ok(0)
    }
    
    // Safe token transfer from contract
    fn safe_transfer_from_contract(env: &Env, kale_client: &token::Client, to: &Address, amount: i128) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        match kale_client.try_transfer(&env.current_contract_address(), &to, &amount) {
            Ok(_) => Ok(()),
            Err(_) => Err(Error::TokenTransferFailed),
        }
    }
    
    // Safe KALE client initialization
    fn get_kale_client(env: &Env) -> Result<token::Client, Error> {
        let kale_asset_address = Address::from_str(&env, "CAAVU2UQJLMZ3GUZFM56KVNHLPA3ZSSNR4VP2U53YBXFD2GI3QLIVHZZ");
        Ok(token::Client::new(&env, &kale_asset_address))
    }
    
    // Safe mining client initialization
    fn get_mining_client(env: &Env) -> Result<KaleMiningClient, Error> {
        let kale_mining_address = Address::from_str(&env, "CDSWUUXGPWDZG76ISK6SUCVPZJMD5YUV66J2FXFXFGDX25XKZJIEITAO");
        Ok(KaleMiningClient::new(&env, &kale_mining_address))
    }
    
    // Safe KALE approval
    fn safe_approve_kale(env: &Env, creator: &Address) -> Result<(), Error> {
        let kale_client = Self::get_kale_client(&env)?;
        
        // Max Duration - 6 Months, after this RIP
        match kale_client.try_approve(&creator, &env.current_contract_address(), &1_000_000, &(&env.storage().max_ttl() - 1)) {
            Ok(_) => Ok(()),
            Err(_) => Err(Error::TokenTransferFailed),
        }
    }

    /// Get the complete scoreboard with all player statistics including earnings
    pub fn get_scoreboard(env: Env) -> Vec<ScoreboardEntry> {
        let all_players: Vec<Address> = env.storage().instance().get(&DataKey::AllPlayers).unwrap_or(vec![&env]);
        let mut scoreboard: Vec<ScoreboardEntry> = vec![&env];
        
        for player in all_players.iter() {
            if let Some(stats) = env.storage().instance().get::<DataKey, PlayerStats>(&DataKey::PlayerStats(player.clone())) {
                let trust_score = stats.circles_joined as i32 - stats.circles_betrayed as i32;
                
                let betrayal_ratio = if stats.circles_joined > 0 {
                    (stats.circles_betrayed * 100) / stats.circles_joined
                } else {
                    0
                };
                
                let kale_per_circle = if stats.circles_joined > 0 {
                    stats.total_kale_earned / stats.circles_joined as i128
                } else {
                    0
                };
                
                let entry = ScoreboardEntry {
                    address: stats.address.clone(),
                    circles_created: stats.circles_created,
                    circles_joined: stats.circles_joined,
                    circles_betrayed: stats.circles_betrayed,
                    times_betrayed: stats.times_betrayed,
                    trust_score,
                    betrayal_ratio,
                    total_kale_earned: stats.total_kale_earned,
                    kale_per_circle,
                };
                
                scoreboard.push_back(entry);
            }
        }
        
        scoreboard
    }
    
    /// Get statistics for a specific player
    pub fn get_player_stats(env: Env, player: Address) -> Option<PlayerStats> {
        env.storage().instance().get(&DataKey::PlayerStats(player))
    }
    
    /// Get detailed earnings for a specific player
    pub fn get_player_earnings(env: Env, player: Address) -> Option<PlayerEarnings> {
        env.storage().instance().get(&DataKey::PlayerEarnings(player))
    }
    
    /// Get earnings for a specific circle
    pub fn get_circle_earnings(env: Env, circle_id: u32) -> Option<CircleEarnings> {
        env.storage().instance().get(&DataKey::CircleEarnings(circle_id))
    }
    
    /// Get total KALE earned across all circles
    pub fn get_total_kale_earned(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalKaleEarned).unwrap_or(0)
    }
    
    /// Get top earning circles
    pub fn get_top_earning_circles(env: Env, limit: u32) -> Vec<CircleEarnings> {
        let all_circle_ids: Vec<u32> = env.storage().instance().get(&DataKey::AllCircleIds).unwrap_or(vec![&env]);
        let mut circle_earnings: Vec<CircleEarnings> = vec![&env];
        
        for circle_id in all_circle_ids.iter() {
            if let Some(earnings) = env.storage().instance().get::<DataKey, CircleEarnings>(&DataKey::CircleEarnings(circle_id.clone())) {
                circle_earnings.push_back(earnings);
            }
        }
        
        // Sort by total_earned (descending) and return top results
        // Note: Soroban SDK doesn't have built-in sorting, so we'd need to implement it manually
        // For now, just return all earnings (client can sort)
        circle_earnings
    }
    
    /// Get total participation statistics including earnings
    pub fn get_total_stats(env: Env) -> (u32, u32, u32, u32, i128) {
        let all_players: Vec<Address> = env.storage().instance().get(&DataKey::AllPlayers).unwrap_or(vec![&env]);
        let mut total_players = 0u32;
        let mut total_circles_created = 0u32;
        let mut total_circles_joined = 0u32;
        let mut total_betrayals = 0u32;
        let mut total_kale_earned = 0i128;
        
        for player in all_players.iter() {
            if let Some(stats) = env.storage().instance().get::<DataKey, PlayerStats>(&DataKey::PlayerStats(player.clone())) {
                total_players += 1;
                total_circles_created += stats.circles_created;
                total_circles_joined += stats.circles_joined;
                total_betrayals += stats.circles_betrayed;
                total_kale_earned += stats.total_kale_earned;
            }
        }
        
        (total_players, total_circles_created, total_circles_joined, total_betrayals, total_kale_earned)
    }

    // Helper functions for updating player statistics and earnings
    
    fn update_player_stats_created(env: &Env, player: &Address) {
        Self::ensure_player_exists(env, player);
        
        let mut stats: PlayerStats = env.storage().instance().get(&DataKey::PlayerStats(player.clone())).unwrap();
        stats.circles_created += 1;
        env.storage().instance().set(&DataKey::PlayerStats(player.clone()), &stats);
    }
    
    fn update_player_stats_joined(env: &Env, player: &Address) {
        Self::ensure_player_exists(env, player);
        
        let mut stats: PlayerStats = env.storage().instance().get(&DataKey::PlayerStats(player.clone())).unwrap();
        stats.circles_joined += 1;
        env.storage().instance().set(&DataKey::PlayerStats(player.clone()), &stats);
    }
    
    fn update_player_stats_betrayed(env: &Env, player: &Address) {
        Self::ensure_player_exists(env, player);
        
        let mut stats: PlayerStats = env.storage().instance().get(&DataKey::PlayerStats(player.clone())).unwrap();
        stats.circles_betrayed += 1;
        env.storage().instance().set(&DataKey::PlayerStats(player.clone()), &stats);
    }
    
    fn update_player_stats_was_betrayed(env: &Env, player: &Address) {
        Self::ensure_player_exists(env, player);
        
        let mut stats: PlayerStats = env.storage().instance().get(&DataKey::PlayerStats(player.clone())).unwrap();
        stats.times_betrayed += 1;
        env.storage().instance().set(&DataKey::PlayerStats(player.clone()), &stats);
    }
    
    // New earnings tracking functions
    fn update_player_earnings_own_circle(env: &Env, player: &Address, amount: i128) {
        Self::ensure_player_earnings_exists(env, player);
        
        let mut earnings: PlayerEarnings = env.storage().instance().get(&DataKey::PlayerEarnings(player.clone())).unwrap();
        earnings.total_kale_earned += amount;
        earnings.kale_earned_from_own_circles += amount;
        env.storage().instance().set(&DataKey::PlayerEarnings(player.clone()), &earnings);
        
        // Also update player stats
        let mut stats: PlayerStats = env.storage().instance().get(&DataKey::PlayerStats(player.clone())).unwrap();
        stats.total_kale_earned += amount;
        env.storage().instance().set(&DataKey::PlayerStats(player.clone()), &stats);
    }
    
    fn update_player_earnings_joined_circle(env: &Env, player: &Address, amount: i128) {
        Self::ensure_player_earnings_exists(env, player);
        
        let mut earnings: PlayerEarnings = env.storage().instance().get(&DataKey::PlayerEarnings(player.clone())).unwrap();
        earnings.total_kale_earned += amount;
        earnings.kale_earned_from_join_circles += amount;
        env.storage().instance().set(&DataKey::PlayerEarnings(player.clone()), &earnings);
        
        // Also update player stats
        let mut stats: PlayerStats = env.storage().instance().get(&DataKey::PlayerStats(player.clone())).unwrap();
        stats.total_kale_earned += amount;
        env.storage().instance().set(&DataKey::PlayerStats(player.clone()), &stats);
    }
    
    fn update_player_earnings_betrayal(env: &Env, player: &Address, amount: i128) {
        Self::ensure_player_earnings_exists(env, player);
        
        let mut earnings: PlayerEarnings = env.storage().instance().get(&DataKey::PlayerEarnings(player.clone())).unwrap();
        earnings.total_kale_earned += amount;
        earnings.kale_earned_from_betrayals += amount;
        env.storage().instance().set(&DataKey::PlayerEarnings(player.clone()), &earnings);
        
        // Also update player stats
        let mut stats: PlayerStats = env.storage().instance().get(&DataKey::PlayerStats(player.clone())).unwrap();
        stats.total_kale_earned += amount;
        env.storage().instance().set(&DataKey::PlayerStats(player.clone()), &stats);
    }
    
    fn update_circle_earnings(env: &Env, circle_id: u32, amount: i128) {
        let mut earnings: CircleEarnings = env.storage().instance().get(&DataKey::CircleEarnings(circle_id)).unwrap_or(
            CircleEarnings {
                circle_id,
                total_earned: 0,
                total_harvests: 0,
                average_per_harvest: 0,
                last_harvest_amount: 0,
            }
        );
        
        earnings.total_earned += amount;
        earnings.total_harvests += 1;
        earnings.average_per_harvest = if earnings.total_harvests > 0 {
            earnings.total_earned / earnings.total_harvests as i128
        } else {
            0
        };
        earnings.last_harvest_amount = amount;
        
        env.storage().instance().set(&DataKey::CircleEarnings(circle_id), &earnings);
        
        // Also update the circle's total earnings
        if let Some(mut circle) = env.storage().instance().get::<DataKey, Circle>(&DataKey::Circle(circle_id)) {
            circle.total_kale_earned += amount;
            env.storage().instance().set(&DataKey::Circle(circle_id), &circle);
        }
    }
    
    fn ensure_player_exists(env: &Env, player: &Address) {
        if !env.storage().instance().has(&DataKey::PlayerStats(player.clone())) {
            // Create new player stats
            let stats = PlayerStats {
                address: player.clone(),
                circles_created: 0,
                circles_joined: 0,
                circles_betrayed: 0,
                times_betrayed: 0,
                total_kale_earned: 0,
            };
            env.storage().instance().set(&DataKey::PlayerStats(player.clone()), &stats);
            
            // Add to all players list
            let mut all_players: Vec<Address> = env.storage().instance().get(&DataKey::AllPlayers).unwrap_or(vec![&env]);
            all_players.push_back(player.clone());
            env.storage().instance().set(&DataKey::AllPlayers, &all_players);
        }
    }
    
    fn ensure_player_earnings_exists(env: &Env, player: &Address) {
        // First ensure the player stats exist
        Self::ensure_player_exists(env, player);
        
        if !env.storage().instance().has(&DataKey::PlayerEarnings(player.clone())) {
            // Create new player earnings
            let earnings = PlayerEarnings {
                address: player.clone(),
                total_kale_earned: 0,
                kale_earned_from_own_circles: 0,
                kale_earned_from_join_circles: 0,
                kale_earned_from_betrayals: 0,
            };
            env.storage().instance().set(&DataKey::PlayerEarnings(player.clone()), &earnings);
        }
    }

    /// Get circle information including member count and earnings
    pub fn get_circle_info(env: Env, circle_id: u32) -> Option<(String, bool, Address, u32, i128)> {
        let circle: Option<Circle> = env.storage().instance().get(&DataKey::Circle(circle_id));
        
        circle.map(|c| (c.name, c.betrayed, c.creator, c.member_count, c.total_kale_earned))
    }
    
    /// Get all created circles with earnings information
    pub fn get_all_circles(env: Env) -> Vec<CircleInfo> {
        let all_circle_ids: Vec<u32> = env.storage().instance().get(&DataKey::AllCircleIds).unwrap_or(vec![&env]);
        let mut circle_infos: Vec<CircleInfo> = vec![&env];
        
        for circle_id in all_circle_ids.iter() {
            let circle_id_val = circle_id.clone(); // Clone the u32 value
            if let Some(circle) = env.storage().instance().get::<DataKey, Circle>(&DataKey::Circle(circle_id_val)) {
                let info = CircleInfo {
                    circle_id: circle_id_val,
                    name: circle.name,
                    betrayed: circle.betrayed,
                    creator: circle.creator,
                    member_count: circle.member_count,
                    total_kale_earned: circle.total_kale_earned,
                };
                circle_infos.push_back(info);
            }
        }
        
        circle_infos
    }
    
    /// Get Circle information based on owner information with earnings
    pub fn get_owner_circle(env: Env, wallet: Address) -> Option<(String, bool, Address, u32, u32, i128)> {
        let circle_id: Option<u32> = env.storage().instance().get(&DataKey::CreatedCircle(wallet));
        
        if let Some(id) = circle_id {
            let circle: Option<Circle> = env.storage().instance().get(&DataKey::Circle(id));
            return circle.map(|c| (c.name, c.betrayed, c.creator, c.member_count, id, c.total_kale_earned));
        }
        
        None
    }

    /// Get all circles a wallet has joined
    pub fn get_wallet_circles(env: Env, wallet: Address) -> Vec<u32> {
        env.storage().instance().get(&DataKey::WalletCircle(wallet)).unwrap_or(vec![&env])
    }
    
    /// Get all members of a circle
    pub fn get_circle_members(env: Env, circle_id: u32) -> Vec<Address> {
        env.storage().instance().get(&DataKey::CircleMembers(circle_id)).unwrap_or(vec![&env])
    }
    
    /// Check if a wallet is in any circle
    pub fn is_in_circle(env: Env, wallet: Address) -> bool {
        let user_circles: Vec<u32> = env.storage().instance().get(&DataKey::WalletCircle(wallet)).unwrap_or(vec![&env]);
        !user_circles.is_empty()
    }

    /// Check if a wallet is in a specific circle
    pub fn is_in_specific_circle(env: Env, wallet: Address, circle_id: u32) -> bool {
        let user_circles: Vec<u32> = env.storage().instance().get(&DataKey::WalletCircle(wallet)).unwrap_or(vec![&env]);
        
        for user_circle_id in user_circles.iter() {
            if user_circle_id == circle_id {
                return true;
            }
        }
        
        false
    }

    /// Original hello function (keeping for compatibility)
    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }
    
    // Helper function to get next circle ID
    fn get_next_circle_id(env: &Env) -> u32 {
        env.storage().instance().get(&DataKey::NextCircleId).unwrap_or(1)
    }

    fn check_password(env: &Env, password: String, password_hash: BytesN<32>) -> Result<bool, Error>{
        let password_len = password.len() as usize;
        let mut password_bytes = [0u8; 256];
        if password_len <= 256 {
            let slice = &mut password_bytes[..password_len];
            password.copy_into_slice(slice);
            let password_bytes_soroban = Bytes::from_slice(&env, &slice);
            let provided_hash: BytesN<32> = env.crypto().sha256(&password_bytes_soroban).into();
            if provided_hash != password_hash {
                return Err(Error::WrongPassword);
            }
        } else {
            return Err(Error::LongPassword);
        }
        Ok(true)
    }
}