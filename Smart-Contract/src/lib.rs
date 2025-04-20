#![no_std]
use gstd::{async_main, collections::HashMap, msg, prelude::*, ActorId};
use io::*;

// 1. Create the main state as a static variable.
static mut STATE: Option<CustomStruct> = None;

// Create a public State
#[derive(Clone, Default)]
pub struct CustomStruct {

    pub owner: ActorId,  // Add owner field

    pub id_number: u128,
    pub collected_funds: u128, 
    pub decimal_const: u128,

    pub supported_stocks: Vec<String>,
    pub user_operations: HashMap<ActorId, Vec<Operation> >,
}

// Create a implementation on State
impl CustomStruct {

    pub fn new_operation(&mut self, input: OpenOperationInput) -> Result<Events, Errors> {
        
        let actor_id = msg::source();
        let mut transferred_value = msg::value();

        if self.supported_stocks.contains(&input.ticker_symbol) == false {
            return Err( Errors::NotSupportedStock { stock: input.ticker_symbol.clone() } )
        }

        // Handle Comission
        let commission: u128 = (transferred_value * 25) / 1000; // 2.5% of transferred_value
        transferred_value = transferred_value - commission;
        self.collected_funds = self.collected_funds + commission;

        let final_investment = input.investment.clone() - (input.investment.clone() * 25) / 1000;


        // If the actor_id doesn't exist in user_operations, create a new entry with an empty vector
        let operations = self.user_operations.entry(actor_id).or_insert(Vec::new());

        // Create a new operation with the provided input and an id of 0
        let new_operation = Operation {
            id: self.id_number,                             // Used to identify the user operations
            ticker_symbol: input.ticker_symbol.clone(),     // Stock
            operation_type: input.operation_type.clone(),   // 0 = BUY operation, 1 = SELL operation
            operation_state: false,                         // false = open, true = close
            leverage: input.leverage.clone(),               // Leverage for multiply earnings
            open_date: input.date.clone(),                  // Actual Date
            close_date: String::new(),                      // Empty string as it is not closed yet
            investment: final_investment,                   // Final Invesmtent on dollars
            open_price: input.open_price.clone(),           // Stock price when operation is open
            closed_price: 0,                                // Not Set for now
        };
        
        // change the id for next operation
        self.id_number = self.id_number+1;

        // Push the new operation to the vector of operations
        operations.push(new_operation);

        Ok(Events::OperationCreated{
            id: self.id_number-1,
            final_vara_investment: transferred_value.clone(),
            vara_comission: commission.clone(),
        })

    }

    pub fn close_operation(&mut self, input: CloseOperationInput) -> Result<Events, Errors> {
        let actor_id = msg::source();
    
        if self.id_number < input.operation_id {
            return Err(Errors::OperationDoesntExist { id: input.operation_id });
        }
    
        // Extract the operation details first to avoid holding the mutable borrow on `self`
        let operation = if let Some(operations) = self.user_operations.get_mut(&actor_id) {
            if let Some(operation) = operations.iter_mut().find(|op| op.id == input.operation_id) {
                if operation.operation_state {
                    return Err(Errors::OperationAlreadyClosed { id: input.operation_id });
                }
                // Cloning necessary details to avoid holding the borrow
                Some((operation.ticker_symbol.clone(), operation.operation_type, operation.investment, operation.open_price, operation.leverage))
            } else {
                return Err(Errors::UnauthorizedToCloseOperation { id: input.operation_id });
            }
        } else {
            return Err(Errors::UserDoesntHaveAnyOperations { user: actor_id });
        };
    
        // Ensure operation was found
        let (_ticker_symbol, operation_type, investment, open_price, leverage) = operation.unwrap();
       
        // Now that the price has been fetched, proceed with closing the operation
        if let Some(operations) = self.user_operations.get_mut(&actor_id) {
            if let Some(operation) = operations.iter_mut().find(|op| op.id == input.operation_id) {
                // Set the operation state to closed and update the close date
                operation.operation_state = true;
                operation.close_date = input.date.clone();
                operation.closed_price = input.close_price.clone();
    
                // Calculate the investment return based on the operation type
                let mut profit: i128 = 
                if operation_type { // For SELL operation (1 = SELL)
                    investment as i128 * (open_price as i128 - input.close_price as i128) / open_price as i128
                } else { // For BUY operation (0 = BUY)
                    investment as i128 * (input.close_price as i128 - open_price as i128) / open_price as i128
                };

                // Apply leverage
                profit = profit.saturating_mul(leverage as i128);

                // Calculate the final investment return, ensuring it doesn't go below zero
                let dolar_investment_return = (investment as i128 + profit).max(0) as u128;

                // Convert dollars to vara in order to return money to the user
                let vara_investment_return: u128 = dolar_investment_return * input.vara_factor / self.decimal_const;

                // Send vara to user if the final investment return is greater than or equal to the decimal constant
                if vara_investment_return >= self.decimal_const {
                    msg::send(actor_id, (), vara_investment_return).expect("Failed to transfer coins to owner");
                }

                return Ok(Events::OperationClosed {
                    vara_investment_return: vara_investment_return,
                    dolar_investment_return: dolar_investment_return,
                });
            }
        }
    
        Err(Errors::OperationDoesntExist { id: input.operation_id })

    }


    pub fn set_supported_stocks(&mut self, new_supported_stocks: Vec<String>) -> Result<Events, Errors> {

        let caller = msg::source();
        if caller != self.owner {
            return Err(Errors::UnauthorizedAction)
        }

        self.supported_stocks = new_supported_stocks;
        Ok(Events::SupportedStocksSetSuccessfully)

    }

    pub fn deposit_funds_to_owner(&mut self) -> Result<Events, Errors> {
        let caller = msg::source();
        if caller != self.owner {
            return Err(Errors::UnauthorizedAction);
        }

        let funds_to_deposit = self.collected_funds;
        self.collected_funds = 0; // Reset collected funds

        // Perform the actual transfer to the owner
        msg::send(self.owner, (), funds_to_deposit).expect("Failed to transfer funds to owner");
        Ok(Events::FuntsDepositedSuccessfully{
            funds: funds_to_deposit,
            account: self.owner
        })
    }

}




// 3. Create the init() function of your contract.
#[no_mangle]
extern "C" fn init() {
    let config: InitStruct = msg::load().expect("Unable to decode InitStruct");

    let state = CustomStruct {
        owner: config.owner,  // Initialize the owner field
        id_number: 0,
        decimal_const: 1000000000000,
        ..Default::default()
    };

    unsafe { STATE = Some(state) };
}

// 4.Create the main() function of your contract.
#[async_main]
async fn main() {
    // We load the input message
    let action: Actions = msg::load().expect("Could not load Action");

    let state: &mut CustomStruct =
        unsafe { STATE.as_mut().expect("The contract is not initialized") };

    // We receive an action from the user and update the state. Example:
    let reply = match action {

        Actions::OpenOperation(input) => state.new_operation(input), // Here, we call the implementation
        Actions::CloseOperation(input) => state.close_operation(input), // Here, we call the implementation

        Actions::SetSupportedStocks(input) => state.set_supported_stocks(input), 
        Actions::DepositFoundsToOwner => state.deposit_funds_to_owner(), 

    };
    msg::reply(reply, 0).expect("Error in sending a reply");
}

// 5. Create the state() function of your contract.
#[no_mangle]
extern "C" fn state() {
    let state = unsafe { STATE.take().expect("Unexpected error in taking state") };
    let query: Query = msg::load().expect("Unable to decode the query");

    let reply = match query {

        Query::AllOperations(actor_id) => {
            let operations = state.user_operations
            .get(&actor_id)
            .cloned() // Create a copy of the vector if it exists
            .unwrap_or_else(Vec::new); // Return an empty vector if it doesn't exist

            QueryReply::AllOperations(operations) // Provide the vector directly
        },

        Query::ActiveOperations(actor_id) => {
            let answer: Vec<Operation> = state.user_operations
                .get(&actor_id)
                .map(|operations| {
                    operations.iter()
                        .filter(|op| !op.operation_state) // Only include open operations
                        .cloned()
                        .collect()
                })
                .unwrap_or_else(|| Vec::new()); // Handle None case if necessary
            QueryReply::ActiveOperations(answer)
        },

        Query::ClosedOperations(actor_id) => {
            let answer: Vec<Operation> = state.user_operations
                .get(&actor_id)
                .map(|operations| {
                    operations.iter()
                        .filter(|op| op.operation_state) // Only include closed operations
                        .cloned()
                        .collect()
                })
                .unwrap_or_else(|| Vec::new()); // Handle None case if necessary
            QueryReply::ClosedOperations(answer)
        },

        Query::SupportedStocks => QueryReply::SupportedStocks(state.supported_stocks),
        Query::CollectedFunds => QueryReply::CollectedFunds(state.collected_funds),
        
    };

    msg::reply(reply, 0).expect("Error on sharing state");
}
