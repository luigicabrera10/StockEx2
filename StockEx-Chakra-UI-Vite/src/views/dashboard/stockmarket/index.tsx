import React, { useEffect, useState } from 'react';

// Chakra imports
import { Box, Button, Flex, Grid, Link, Text, useColorModeValue, SimpleGrid } from '@chakra-ui/react';

// StockEx imports
import SearchBar from './components/searchBar';
import MarketTable from './components/MarketTable';

import { fetchAllRealTimeStocks } from '@/utils/data/stocks/stockCurrentPrice';
import { fetchHistoricalPreviewStocks } from '@/utils/data/stocks/stockHistorical';

export default function Marketplace() {
	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorBrand = useColorModeValue('brand.500', 'white');

	// Search filter var
	const [StocksPrices, setStocksPrices] = useState<any>([]);
	const [StocksPreview, setStocksPreview] = useState<any>([]);

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
				/>
				
			</SimpleGrid>

		</Box>
	);
}
