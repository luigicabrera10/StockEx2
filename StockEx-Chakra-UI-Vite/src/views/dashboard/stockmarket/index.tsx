import React, { useEffect, useState } from 'react';

// Chakra imports
import { Box, Button, Flex, Grid, Link, Text, useColorModeValue, SimpleGrid } from '@chakra-ui/react';

// StockEx imports
import SearchBar from './components/searchBar';
import MarketTable from './components/MarketTable';

import { fetchAllRealTimeStocks } from '@/utils/data/stocks/stockCurrentPrice';
import { fetchHistoricalPreviewStocks } from '@/utils/data/stocks/stockHistorical';
import { useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';
import { fetchCryptoPrice } from '@/utils/data/currency/currencyPrice';

export default function Marketplace() {
	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorBrand = useColorModeValue('brand.500', 'white');

	// Search filter var
	const [StocksPrices, setStocksPrices] = useState<any>([]);
	const [StocksPreview, setStocksPreview] = useState<any>([]);

	const [VaraPrice, setVaraPrice] = useState<number>(0);

	// Acount balance
	const { account } = useAccount();
	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();
	
	const finalBalance = balance ? parseFloat(getFormattedBalance(balance).value.replace(/,/g, '')) : 0.0;

	useEffect(() => {
		async function getDataRealTimeData() {
			const data = await fetchAllRealTimeStocks();
			setStocksPrices(data);
		}
		getDataRealTimeData();
  	}, []);

	useEffect(() => {
		async function getDataPreviewData() {
			const previewData = await fetchHistoricalPreviewStocks();
			setStocksPreview(previewData);
		}

		const fetchVaraPrice = async () => {
			const data = await fetchCryptoPrice('VARA');
			if (data) {
				setVaraPrice(data.price ?? 0.0);
			}
		}
		fetchVaraPrice();
		getDataPreviewData();
	}, []);

	const fixData = (data: any, preview: any) => {
		let finalResult = Object.entries(data).map(([stock, info]: [string, any]) => ({
			stock: stock,
			currentPrice: info.price,
			lastClosedPrice: info.previousClose,
			volume: preview[stock] && preview[stock].length > 0 ? preview[stock][0].volume : 0,
			priceProfit: [info.difference, info.differencePercent],
			previewPrices: preview[stock] 
				? preview[stock].map((item: any) => item.close).reverse()
				: null,
		}));
		return finalResult;
	}

	const marketData = fixData(StocksPrices, StocksPreview);
	console.log("Final Data: ", marketData);
	
	return (
		<Box pt={{ base: '180px', md: '80px', xl: '80px' }}>
			
			<SimpleGrid gap='20px' mb='20px' alignContent='start'>

				{/* <SearchBar onChange={handleSearchChange} /> */}

				<MarketTable 
					tableData={marketData} 
					balance={finalBalance} 
					prices={
						{
							'USD': 1.0,
							'VARA': 1 / VaraPrice,
						}
					} 
				/>
				
			</SimpleGrid>

		</Box>
	);
}
