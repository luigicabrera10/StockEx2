// Chakra imports
import { Avatar, Box, Grid, Flex, FormLabel, Icon, Select, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Text } from '@chakra-ui/react';
import { useApi, useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';

import { fetchHistoricalPreviewStocks } from '@/utils/data/stocks/stockHistorical';
import { fetchRealTimeStocks } from '@/utils/data/stocks/stockCurrentPrice';
import { fetchCryptoPrice } from '@/utils/data/currency/currencyPrice';

import Card from '@/components/card/Card';
import { ChevronDownIcon } from '@chakra-ui/icons';

import CandleChart from '@/components/charts/CandleChart';
import StockIcon from '@/utils/data/stocks/StockIcon';
import StockButton from './components/TradeButton'

export default function StockCharts() {
	const [allStocks, setAllStocks] = useState<string[]>([]);
	const [SelectedStock, setSelectedStock] = useState<string>('TSLA'); // Default to Tesla stock

	const [StockPrice, setStockPrice] = useState<number>(0);
	const [StockProfit, setStockProfit] = useState<number>(0);
	const [StockProfitPercent, setStockProfitPercent] = useState<number>(0);

	const [VaraPrice, setVaraPrice] = useState<number>(0);

	// Acount balance
	const { account } = useAccount();
	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();
	
	const finalBalance = balance ? parseFloat(getFormattedBalance(balance).value) : 0.0;

	useEffect(() => {
		const fetchStocks = async () => {
			const previewData = await fetchHistoricalPreviewStocks();
			if (previewData) {
				const stockSymbols = Object.keys(previewData);
				setAllStocks(stockSymbols);
				if (stockSymbols.length > 0 && !SelectedStock) {
					setSelectedStock('TSLA'); // Default to Tesla if no stock is selected
				}
			}
		};

		const fetchVaraPrice = async () => {
			const data = await fetchCryptoPrice('VARA');
			if (data) {
				setVaraPrice(data.price ?? 0.0);
			}
		}

		fetchStocks();
		fetchVaraPrice();
	}, []);

	useEffect( () => {
		const fetcheCurrentPrice = async () => {
			const data = await fetchRealTimeStocks([SelectedStock]);
			if (data) {
				setStockPrice(data[SelectedStock].price ?? 0.0);
				setStockProfit(data[SelectedStock].difference ?? 0.0);
				setStockProfitPercent(data[SelectedStock].differencePercent ?? 0.0);
			}
		}
		fetcheCurrentPrice();
	}, [SelectedStock]);

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedStock(event.target.value);
	};

	return (
		<Box pt={{ base: '130px', md: '80px', xl: '80px' }} height='calc(100vh - 80px)'>
			<SimpleGrid
				gap='20px'
				height="100%" // Ensure the grid takes full height
				templateRows={{
					base: '1fr 10fr', // Equal height for both cards on smaller screens
					lg: '1fr 10fr',   // Equal height for both cards on larger screens
				}}
			>
				<Card height="100%"> {/* Ensure each card takes full height */}
					<Flex flexDirection='row' justifyContent='space-between' alignItems='center'>
						<Flex flexDirection='row' gap='20px'>
							<StockIcon symbol={SelectedStock} width='110px' height='110px' borderRadius='5px' />
							<Flex alignContent='center' justifyContent='center' flexDirection='column' gap='7px'>
								<Select
									value={SelectedStock}
									onChange={handleChange}
									placeholder=""
									icon={<ChevronDownIcon />}
									fontSize='37px'
									fontWeight='800'
									iconSize="30px"
									padding='0px'
									paddingLeft='0px'
									sx={{
										cursor: 'pointer',
										background: 'transparent',
										border: 'none',
										option: {
											fontSize: '20px',
										},
									}}
								>
									{allStocks.map(stock => (
										<option key={stock} value={stock}>
											{stock}
										</option>
									))}
								</Select>

								<Box> 			
								
									<Text fontSize='20px'>
										{'$ ' + StockPrice.toFixed(3)}
									</Text>

									<Flex alignItems='baseline' gap='8px'>

										<Text textColor={StockProfit >= 0? 'rgb(0,255,0)' : 'rgb(255,0,0)'} fontSize='20px'>
											{(StockProfit >= 0? ' + $ ' : ' - $ ') + Math.abs(StockProfit).toFixed(3)}
										</Text>

										<Text textColor={StockProfitPercent >= 0? 'rgb(0,255,0)' : 'rgb(255,0,0)'} fontSize='20px'>
											{ '( ' + (StockProfitPercent >= 0 ? ' + ' : ' - ') + Math.abs(StockProfitPercent).toFixed(2) + ' % )'}
										</Text>

									</Flex>

								</Box>


							</Flex>
						</Flex>

						<StockButton 
							text="Trade Now!" 
							stock={SelectedStock} 
							price={StockPrice}
							balance={finalBalance} 
							prices={
								{
									'USD': 1.0,
									'VARA': 1 / VaraPrice,
								}
							} 
						/>

					</Flex>
				</Card>
				<Card height="100%"> {/* Ensure each card takes full height */}
					<CandleChart stock={SelectedStock} />
				</Card>
			</SimpleGrid>
		</Box>
	);
}