// Chakra imports
import { Avatar, Box, Grid, Flex, FormLabel, Icon, Select, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
// Custom components
import MiniCalendar from '../../../components/calendar/MiniCalendar';
import PortfolioStatistics from './components/PortfolioStatistics';
import IconBox from '../../../components/icons/IconBox';
import { MdAddTask, MdAttachMoney, MdBarChart, MdFileCopy } from 'react-icons/md';
import { GiProfit } from "react-icons/gi";
import { FaChartLine } from "react-icons/fa6";
import OperationTable from './components/OperationsTable';

// import { ReadOperations } from '@/smartContractComunication/read/ReadOperations';
import {Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Stack } from '@chakra-ui/react';
import { RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb } from '@chakra-ui/react';


import {ReadOperations} from '@/utils/data/smartContract/read/ReadOperations';
import { fetchAllRealTimeStocks } from '@/utils/data/stocks/stockCurrentPrice';
import { fetchCryptoPrice } from '@/utils/data/currency/currencyPrice';

import React, { useState, useEffect } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

import { useApi, useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';


export default function Portfolio() {

	// Chakra Color Mode
	const brandColor = useColorModeValue('brand.500', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

	const decimalConst = Math.pow(10, 12);

	// For connecting polkadot wallet:
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	// const [account, setAccount] = useState<string | null>(null);
	const [OperationStateValue, setOperationStateValue] = useState('all');
	const [OperationTypeValue, setOperationTypeValue] = useState('all');
	const [StockValue, setStockValue] = useState('any');
	const [LeverageRange, setLeverageRange] = useState([0, 100]);

	const [InvestmentRange, setInvestmentRange] = useState([0, 10000]);
	const [MinMaxInvestment, setMinMaxInvestment] = useState([0, 10000]);

	const [EarningsRange, setEarningsRange] = useState([0, 10000]);
	const [MinMaxEarnings, setMinMaxEarnings] = useState([0, 10000]);

	const DefaultSelectedDates: [Date, Date] = [new Date((new Date()).setMonth((new Date()).getMonth() - 1)), new Date((new Date()).setHours(23, 59, 59, 59))];
	const [SelectedDates, setSelectedDates] = useState<[Date, Date]>(DefaultSelectedDates);
	// const [DefaultSelectedDates, setDefaultSelectedDates] = useState<[Date, Date]>([new Date(0), new Date()]);

	// fetch Prices:
	// const { stock_prices, stock_loading, stock_error } = useRealTimeStockPrices();
	// const { CurrencyPrices, CurrencyLoading, CurrencyError } = useCurrencyPrices();
	const [SelectedCurrency, setSelectedCurrency] = useState('USD');

	// mini statics:
	const [ActiveOp, setActiveOp] = useState(0);
	const [ClosedOp, setClosedOp] = useState(0);
	const [Earnings, setEarnings] = useState('$ 0');
	const [Invested, setInvested] = useState('$ 0');

	const [EarningsPercent, setEarningsPercent] = useState(0.0);
	const [InvestedPercent, setInvestedPercent] = useState(0.0);
	const [FixedBalance, setFixedBalance] = useState(0.0);
	const [OpenThisMonth, setOpenThisMonth] = useState(0);
	const [ClosedThisMonth, setClosedThisMonth] = useState(0);

	const [VaraEarnings, setVaraEarnings] = useState('0 TVARA');
	const [VaraInvested, setVaraInvested] = useState('0 TVARA');

    const [StocksPrices, setStocksPrices] = useState<any>(null);
    const [VaraPrice, setVaraPrice] = useState<number>(0);
    const [currencyBalance, setCurrencyBalance] = useState<number>(0);

	// Vara Balance
	const { account } = useAccount();
	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();

	
	const formattedBalance = balance ? getFormattedBalance(balance) : {value: '0.00', unit: 'TVARA'};
	const varaBalance = parseFloat(formattedBalance.value).toFixed(2) + ' ' + formattedBalance.unit;


    useEffect(() => {
        async function getDataRealTimeData() {
            const data = await fetchAllRealTimeStocks();
            setStocksPrices(data);
        }
        getDataRealTimeData();
    }, []);

    useEffect(() => {
        const fetchVaraPrice = async () => {
            const data = await fetchCryptoPrice('VARA');
            if (data) {
                setVaraPrice(data.price ?? 0.0);
            }
        }
        fetchVaraPrice();
    }, []);

	useEffect(() => {
		// console.log("Vara Price: ", VaraPrice);
		// console.log("Vara Balance: ", formattedBalance.value);
		// console.log("Vara Balance: ", parseFloat(formattedBalance.value.replace(/,/g, '')));
		// console.log("USD Balance: ", parseFloat(formattedBalance.value.replace(/,/g, '')) * VaraPrice);
		setCurrencyBalance(parseFloat(formattedBalance.value.replace(/,/g, '')) * VaraPrice);
	}, [formattedBalance]);

    const data = ReadOperations();
    console.log("RawAllOperations: ", data);

	let fixedOperations: {
		stock: string;
		investment: number;
		opType: boolean;
		openPrice: number;
		actualPrice: number;
		earning: number;
		open_date: string;
		closed_date: string;
		leverage: number;
		operationId: string;
	}[] = [];
	if (data !== undefined && data !== null){

		fixedOperations = data.map(op => {

			const symbol = op.tickerSymbol;
			const investment = (op.investment / decimalConst);  // dolar
			const openPrice = op.openPrice / decimalConst;

			let actualPrice = openPrice; // Default to openPrice if data is not available

			if (StocksPrices) {
				actualPrice = StocksPrices[symbol]["price"] || openPrice; // Fallback to openPrice if symbol not found
			}

			let profit;
			if (!op.operationType) { // Buy Operation
				if (op.closedPrice == 0){
					profit = (op.leverage * investment * ((actualPrice / openPrice ) - 1)); 
				}
				else{
					profit = (op.leverage * investment * (((op.closedPrice / decimalConst) / openPrice ) - 1)); 
				}
			}
			else{ // Sell operation
				if (op.closedPrice == 0){
					profit = (op.leverage * investment * (openPrice  - actualPrice) / openPrice);
				}
				else{
					profit = (op.leverage * investment * (openPrice  - (op.closedPrice / decimalConst)) / openPrice);
				}
			}

			// console.log("Op Type: ", op.operationType);
			// console.log("Op Type true: ", op.operationType === true);
			// console.log("Op Type false: ", op.operationType === false);
			
			return {
				stock: symbol, 
				investment: investment,
				opType: op.operationType,
				openPrice: openPrice,
				actualPrice: actualPrice,
				earning: profit,
				open_date: op.openDate, 
				closed_date: op.closeDate, 
				leverage: op.leverage,
				operationId: op.id
			};
			
		});
	}
	console.log("Final OPERATIONS: ", fixedOperations);


	// Handle filters:

	const handleOperationStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		console.log("Changed State to: ", event.target.value);
		setOperationStateValue(event.target.value);
	};

	const handleOperationTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		console.log("Changed Type to: ", event.target.value);
		setOperationTypeValue(event.target.value);
	};	

	const handleDateChange = (dates: Date | [Date, Date]) => {
		console.log("DATES: ", dates)
		if (Array.isArray(dates)) {
			 const [start, end] = dates;
			 const startMidnight = new Date(start);
			 startMidnight.setHours(0, 0, 0, 0);

			 const endMidnight = new Date(end);
			 endMidnight.setHours(23, 59, 59, 59);

			 setSelectedDates([startMidnight, endMidnight]);
			 console.log('Selected Range:', [startMidnight, endMidnight]);
		} 
		else {
			console.log("DATESIS NOT AN ARRAY?")
		}
  };

	const getAllStocks = (fixedOperations: { stock: string }[]) => {
		const uniqueStocks = Array.from(new Set(fixedOperations.map(op => op.stock)));
		// Create option elements for each stock symbol
		return uniqueStocks.map(stock => (
			 <option key={stock} value={stock}>
				  {stock}
			 </option>
		));
	}



	const prettyNumberMax = (num: number) => {
		if (num === 0) return 0;
	 
		const absNum = Math.abs(num);
		const magnitude = Math.pow(10, Math.max(Math.floor(Math.log10(absNum)), 1));
	 
		let roundedNum = Math.ceil(absNum / magnitude) * magnitude;
	 
		return num < 0 ? -roundedNum : roundedNum;
	}
	 
	const prettyNumberMin = (num: number) => {
		if (num === 0) return 0;
	 
		const absNum = Math.abs(num);
		const magnitude = Math.pow(10, Math.max(Math.floor(Math.log10(absNum)), 1) );
	 
		let roundedNum = Math.ceil(absNum / magnitude) * magnitude;
	 
		return num < 0 ? -roundedNum : roundedNum;
	}

	const getMaxMinEarnings = (fixedOperations: { earning: number }[]) : number[] => {

		if (fixedOperations.length == 0) {
			return [0, 10000]
		}

		let min: number = Number.MAX_VALUE, max:number = -Number.MAX_VALUE;
		fixedOperations.forEach( (op) => {
			const earning: number = op.earning; // You should replace this with actual earning calculation
			min = Math.min(earning, min);
			max = Math.max(earning, max);
			console.log("Max: ", max);
		});

		console.log("Final min: ", min);
		console.log("Final max: ", max);

		if (min < 0) min = Math.floor(min);
		else min = 0;

		if (max < 0) max = 0;
		else max = Math.ceil(max);

		max = prettyNumberMax(max);
		min = prettyNumberMin(min);

		return [min, max];
	}

	const getMaxMinInvestment = (fixedOperations: { investment: number }[]): number[] => {
		let max: number | null = null;
		fixedOperations.forEach( (op) => {
			if (max == null || op.investment > max) max = op.investment;
		});

		if (max == null) max = 10000;

		max = Math.ceil(max);
		max = prettyNumberMax(max);

		return [0, max];
	}

	const handleStockChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		console.log("Changed Stock to: ", event.target.value);
		setStockValue(event.target.value);
	};

	const handleRangeChange = (setRange: React.Dispatch<React.SetStateAction<number[]>>) => (values: number[]) => {
		setRange(values);
		console.log("Changed range to: ", values);
	}

	// Real data
	// const data = account ? AllOperations(account!.decodedAddress) : null;
	// console.log("AllOperations: ",  data);
	
	


	// SET RANGES

	// Use useEffect to update MinMaxInvestment based on your data
	useEffect(() => {
		const newMinMaxInvestment = getMaxMinInvestment(fixedOperations);

		// Check if the new computed value is different from the current state
		if (newMinMaxInvestment[0] !== MinMaxInvestment[0] || newMinMaxInvestment[1] !== MinMaxInvestment[1]) {
			setMinMaxInvestment(newMinMaxInvestment);
		}
	}, [fixedOperations]); // Run this effect whenever fixedOperations changes

	// Another useEffect to update InvestmentRange when MinMaxInvestment changes
	useEffect(() => {
		// Only update InvestmentRange if it's not already within the new MinMaxInvestment range
		if (InvestmentRange[0] !== MinMaxInvestment[0] || InvestmentRange[1] !== MinMaxInvestment[1]) {
			setInvestmentRange(MinMaxInvestment);
		}
	}, [MinMaxInvestment]); 


	useEffect(() => {
		const newMinMaxEarnings = getMaxMinEarnings(fixedOperations);

		// Check if the new computed value is different from the current state
		if (newMinMaxEarnings[0] !== MinMaxEarnings[0] || newMinMaxEarnings[1] !== MinMaxEarnings[1]) {
			setMinMaxEarnings(newMinMaxEarnings);
		}
	}, [fixedOperations]); // Run this effect whenever fixedOperations changes

	// Another useEffect to update EarningsRange when MinMaxEarnings changes
	useEffect(() => {
		// Only update EarningsRange if it's not already within the new MinMaxEarnings range
		if (EarningsRange[0] !== MinMaxEarnings[0] || EarningsRange[1] !== MinMaxEarnings[1]) {
			setEarningsRange(MinMaxEarnings);
		}
	}, [MinMaxEarnings]); 


	// SET Mini Statics:

	useEffect(() => {

		let closedOp: number = 0;
		let activeOp: number = 0;
		let earnings: number = 0;
		let invested: number = 0;

		let closedMonth: number = 0;
		let openMonth: number = 0;

		// const nullDate = new Date(0);
		// let minDate: Date = nullDate;
		// let maxDate: Date = nullDate;

		// console.log('BOTH MIN MAX DATES', minDate);
		// console.log('BOTH MIN MAX DATES', maxDate);

		// Get the current month and year
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();

		fixedOperations.forEach((op) => {
			if (op.closed_date !== '') { // Closed
				closedOp = closedOp + 1;
				
				// Check if the operation was closed this month
				const closeDate = new Date(op.closed_date);
				if (closeDate && closeDate.getMonth() === currentMonth && closeDate.getFullYear() === currentYear) {
					closedMonth += 1;
				}
			}
			else{ // Active
				activeOp = activeOp + 1;
				invested = invested + op.investment;
				earnings += op.earning;
				console.log('For stock ', op.stock, 'getting: ', op.earning);
			}

			// Parse the open and close dates
			const openDate = new Date(op.open_date);

			// Check if the operation was opened this month
			if (openDate.getMonth() === currentMonth && openDate.getFullYear() === currentYear) {
				openMonth += 1;
			}
	  
		})

		setActiveOp(activeOp);
		setClosedOp(closedOp);

		const finalEarnings = earnings;
		const finalInvested = invested;

		setEarnings(finalEarnings >= 0 ? '$ '+ finalEarnings.toFixed(2) : '- $ ' + (finalEarnings*-1).toFixed(2));
		setInvested('$ '+ finalInvested.toFixed(2));

		const totalBalance = currencyBalance + finalInvested;

        setInvestedPercent( parseFloat( (100 * finalInvested / totalBalance).toFixed(2) ) );


		setEarningsPercent(parseFloat((100 * finalEarnings / finalInvested).toFixed(2)));


		setVaraEarnings((finalEarnings / VaraPrice).toFixed(2) + ' TVARA');
		setVaraInvested((finalInvested / VaraPrice).toFixed(2) + ' TVARA');
        // setVaraEarnings(exchange(SelectedCurrency, 'VARA', finalEarnings, CurrencyPrices).toFixed(2) + ' TVARA');
        // setVaraInvested(exchange(SelectedCurrency, 'VARA', finalInvested, CurrencyPrices).toFixed(2) + ' TVARA');


		setFixedBalance(parseFloat((totalBalance + finalEarnings).toFixed(2)));

		setOpenThisMonth(openMonth);
		setClosedThisMonth(closedMonth);

		// if (DefaultSelectedDates[0] !== new Date(minDate.setHours(0, 0, 0, 0)) || DefaultSelectedDates[1] !== new Date(maxDate.setHours(23, 59, 59, 59))){
		// 	// setDefaultSelectedDates([new Date(minDate.setHours(0, 0, 0, 0)), new Date(maxDate.setHours(23, 59, 59, 59))]);
		// }
		// console.log('DEFAULT SELECTED DATES: ', DefaultSelectedDates);
		

	}, [fixedOperations]); // Every time fixedOperations changes


	console.log('SELECTED DATES: ', SelectedDates);
	console.log('DEFAULT SELECTED DATES: ', DefaultSelectedDates);


	return (
		<Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
			<SimpleGrid columns={{ base: 1, md: 2, lg: 3, '2xl': 5 }} gap='20px' mb='20px'>
				<PortfolioStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							// bg={boxBg}
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='32px' h='32px' as={MdAttachMoney} color={brandColor} />}
						/>
					}
					name='Capital'
					// growth='$ 15.265' 
					value={'$ ' + currencyBalance.toFixed(2)}
					rightContent={varaBalance}
					end = {
						<Flex align='center'>
							<Text fontSize='xs' fontWeight='700' me='5px'>
								{'$ ' + FixedBalance}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								total balance
							</Text>
						</Flex>
					}
				/>
				<PortfolioStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							// bg={boxBg}
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='32px' h='32px' as={FaChartLine} color={brandColor} />}
						/>
					}
					// growth='+23%' 
					name='Invested'
					value={Invested}
					rightContent={VaraInvested}
					end = {
						<Flex align='center'>
							<Text fontSize='xs' fontWeight='700' me='5px'>
								{InvestedPercent+ '%'}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								of your capital
							</Text>
						</Flex>
					}
				/>
				<PortfolioStatistics 
					startContent={
						<IconBox
							w='56px'
							h='56px'
							// bg={boxBg}
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='32px' h='32px' as={GiProfit} color={brandColor} />}
						/>
					} 
					// growth='+ 23%' 
					name='Earnings' 
					value={Earnings} 
					rightContent={VaraEarnings}
					end = {
						<Flex align='center'>
							<Text color= {EarningsPercent >= 0.0 ? 'green.500' : 'red'}  fontSize='xs' fontWeight='700' me='5px'>
								{EarningsPercent >= 0.0 ? '+'+EarningsPercent+'%' : EarningsPercent+'%'}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								profit from investments
							</Text>
						</Flex>
					}
				/>
				<PortfolioStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							// bg={boxBg}

							icon={<Icon w='28px' h='28px' as={MdBarChart} color='white' />}
						/>
					}
					name='Active'
					value={ActiveOp + ' operations'}
					end = {
						<Flex align='center'>
							<Text fontSize='xs' fontWeight='700' me='5px'>
								{OpenThisMonth}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								opened this month
							</Text>
						</Flex>
					}
				/>
				<PortfolioStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							// bg={boxBg}
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='32px' h='32px' as={MdAddTask} color={brandColor} />}
						/>
					}
					name='Closed'
					value={ClosedOp + ' operations'}
					end = {
						<Flex align='center'>
							<Text fontSize='xs' fontWeight='700' me='5px'>
								{ClosedThisMonth}
							</Text>
							<Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
								closed this month
							</Text>
						</Flex>
					}
				/>
			</SimpleGrid>

			{/* < CloseOperation operationId={0} /> */}

			{/* <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
				<TotalSpent />
				<WeeklyRevenue />
			</SimpleGrid> */}
			<Grid
				templateColumns={{
					base: '1fr',
					lg: '4.4fr 1fr'
				}}
				templateRows={{
					base: 'repeat(3, 1fr)',
					lg: '1fr'
				}}
				gap={{ base: '35px', xl: '35px' }}>

				<OperationTable 
					tableData={fixedOperations} 
					opState={OperationStateValue}
					opType={OperationTypeValue}
					stock={StockValue}
					investment={InvestmentRange}
					earnings={EarningsRange}
					leverage={LeverageRange}
					dates={SelectedDates}	
				/>
				
				<SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px' alignContent='start'>

					{/* <Box margin='0px'>
					</Box> */}

					{/* <Box>
						<CloseAllOperations/>
					</Box>

					<HSeparator mb='0px' /> */}

					

					<Box mt='10px'>
						<FormLabel fontWeight="bold" fontSize='20px'>Operation State</FormLabel>
						<Select id='op_state'  mt='5px' me='0px' defaultValue={'all'} onChange={handleOperationStateChange}>
							<option value='all'>Any State</option>
							<option value='active'>Active Operations</option>
							<option value='closed'>Closed Operations</option>
						</Select>
					</Box>

					<Box>
						<FormLabel fontWeight="bold" fontSize='20px' >Operation Type</FormLabel>
						<Select id='op_type' mt='5px' me='0px' defaultValue={'all'} onChange={handleOperationTypeChange}>
							<option value='all'>Any Type</option>
							<option value='buy'>Buy Operations</option>
							<option value='sell'>Sell Operations</option>
						</Select>
					</Box>

					<Box>
						<FormLabel fontWeight="bold" fontSize='20px'>Stock</FormLabel>
						<Select id='stock_ticker' mt='5px' me='0px' defaultValue={'any'} onChange={handleStockChange}>
							<option value='any'>Any Stock</option>
							{getAllStocks(fixedOperations)}
						</Select>
					</Box>

					<Box>
						<FormLabel fontWeight="bold" fontSize='20px'>Investment</FormLabel>
						<RangeSlider
							defaultValue={MinMaxInvestment}
							min={MinMaxInvestment[0]}
							max={MinMaxInvestment[1]}
							step={1}
							onChange={handleRangeChange(setInvestmentRange)}
						>
							<RangeSliderTrack>
							<RangeSliderFilledTrack />
							</RangeSliderTrack>
							<RangeSliderThumb index={0} />
							<RangeSliderThumb index={1} />
						</RangeSlider>
						<Text>Min: {InvestmentRange[0]} - Max: {InvestmentRange[1]}</Text>
					</Box>

					<Box>
						<FormLabel fontWeight="bold" fontSize='20px'>Profit</FormLabel>
						<RangeSlider
							defaultValue={[-Number.MAX_VALUE, Number.MAX_VALUE]}
							min={MinMaxEarnings[0]}
							max={MinMaxEarnings[1]}
							step={1}
							onChange={handleRangeChange(setEarningsRange)}
						>
							<RangeSliderTrack>
							<RangeSliderFilledTrack />
							</RangeSliderTrack>
							<RangeSliderThumb index={0} />
							<RangeSliderThumb index={1} />
						</RangeSlider>
						<Text>Min: {EarningsRange[0]} - Max: {EarningsRange[1]}</Text>
					</Box>

					<Box>
						<FormLabel fontWeight="bold" fontSize='20px'>Leverage</FormLabel>
						<RangeSlider
							defaultValue={LeverageRange}
							min={0}
							max={100}
							onChange={handleRangeChange(setLeverageRange)}
						>
							<RangeSliderTrack>
							<RangeSliderFilledTrack />
							</RangeSliderTrack>
							<RangeSliderThumb index={0} />
							<RangeSliderThumb index={1} />
						</RangeSlider>
						<Text>Min: {LeverageRange[0]} - Max: {LeverageRange[1]}</Text>
					</Box>


					<Box>
						<FormLabel fontWeight="bold" fontSize='20px'>Open Date</FormLabel>
						
						<MiniCalendar minW='100%' defaultValue={DefaultSelectedDates} selectRange={true} onDateChange={handleDateChange} />
					</Box>
				
				</SimpleGrid>

			</Grid>

		</Box>
	);
}
