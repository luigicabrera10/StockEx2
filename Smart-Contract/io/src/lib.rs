#![no_std]

use gmeta::{In, InOut, Metadata};
use gstd::{prelude::*, ActorId};
// use chrono::{DateTime, Utc};


pub struct ProgramMetadata;

// 1. Define actions, events, errors and state for your metadata.
impl Metadata for ProgramMetadata {
    type Init = In<InitStruct>;
    type Handle = InOut<Actions, Result<Events, Errors>>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = InOut<Query, QueryReply>;
}

// 2. Create your init Struct(Optional)
#[derive(Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InitStruct {
    pub owner: ActorId,  // Add owner field
}


// Input for create operation action
#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct OpenOperationInput {
   pub ticker_symbol: String, // Like TSL, FB, MSFT
   pub operation_type: bool,  // 0 = BUY operation, 1 = SELL operation
   pub investment: u128, // dolars
   pub open_price: u128,   
   pub leverage: u128,    
   pub date: String,
}

// Input for close operation action
#[derive(Debug, Decode, Encode,  Clone, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct CloseOperationInput {
   pub operation_id: u128,  
   pub date: String,
   pub close_price: u128,  
   pub vara_factor: u128, 
}

// Create Operation Struct
#[derive(Debug, Clone, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct Operation {
    pub id: u128,
    pub ticker_symbol: String,
    pub operation_type: bool,    // 0 = BUY operation, 1 = SELL operation
    pub operation_state: bool,   // 0 = open, 1 = closed
    pub leverage: u128,         // X10 to multiply earnings
    pub open_date: String,       // may change
    pub close_date: String,      // may change
    pub investment: u128,
    pub open_price: u128,
    pub closed_price: u128,
}

// 3. Create your own Actions
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Actions {
    // Add Actions
    OpenOperation(OpenOperationInput),  // Example an action
    CloseOperation(CloseOperationInput), // Example an action

    SetSupportedStocks(Vec<String>),
    DepositFoundsToOwner,
}


// 4. Create your own Events
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Events {
    // Add Events(Example)
    OperationCreated{ // Example an event with a simple input
        id: u128,
        final_vara_investment: u128,
        vara_comission: u128,
    },   
    OperationClosed{
        vara_investment_return: u128,
        dolar_investment_return: u128,
    }, // Example an event with a u128 input
    SupportedStocksSetSuccessfully, // Example an event with a u128 input
    FuntsDepositedSuccessfully { funds: u128, account: ActorId},     
}


// 5. Create your own Errors
#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Errors {

    NotSupportedStock{ stock: String },

    OperationDoesntExist{ id: u128 },
    UserDoesntHaveAnyOperations{ user: ActorId },
    UnauthorizedToCloseOperation{ id: u128 },
    OperationAlreadyClosed{ id: u128 },

    UnauthorizedAction,

}



// 7. Create your State Querys
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Query {
    AllOperations(ActorId),
    ActiveOperations(ActorId),
    ClosedOperations(ActorId),    
    
    SupportedStocks,    
    CollectedFunds,    
}

// 8. Create your State Query Replys
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum QueryReply {
    AllOperations(Vec<Operation>),
    ActiveOperations(Vec<Operation>),
    ClosedOperations(Vec<Operation>),

    SupportedStocks(Vec<String>),    
    CollectedFunds(u128),
 
}
