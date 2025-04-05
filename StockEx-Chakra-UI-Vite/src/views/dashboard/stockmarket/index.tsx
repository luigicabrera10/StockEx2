/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2022 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React, { useEffect, useState } from 'react';

// Chakra imports
import { Box, Button, Flex, Grid, Link, Text, useColorModeValue, SimpleGrid } from '@chakra-ui/react';

// Custom components
// import Banner from './components/Banner';
// import TableTopCreators from './components/TableTopCreators';
// import HistoryItem from './components/HistoryItem';
// import NFT from '../../../components/card/NFT';
// import Card from '../../../components/card/Card';

// Assets
// import Nft1 from '../../../assets/images/nfts/Nft1.png';
// import Nft2 from '../../../assets/images/nfts/Nft2.png';
// import Nft3 from '../../../assets/images/nfts/Nft3.png';
// import Nft4 from '../../../assets/images/nfts/Nft4.png';
// import Nft5 from '../../../assets/images/nfts/Nft5.png';
// import Nft6 from '../../../assets/images/nfts/Nft6.png';
// import Avatar1 from '../../../assets/images/avatars/avatar1.png';
// import Avatar2 from '../../../assets/images/avatars/avatar2.png';
// import Avatar3 from '../../../assets/images/avatars/avatar3.png';
// import Avatar4 from '../../../assets/images/avatars/avatar4.png';
// import tableDataTopCreators from './variables/tableDataTopCreators'; 

// StockEx imports
import SearchBar from './components/searchBar';
import MarketTable from './components/MarketTable';

import { fetchAllRealTimeStocks } from '@/utils/data/stockCurrentPrice';


export default function Marketplace() {
	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorBrand = useColorModeValue('brand.500', 'white');

	// Search filter var
	const [StocksPrices, setStocksPrices] = useState<any>([]);
	const [SearchFilter, setSearchFilter] = useState<string>('');

	useEffect(() => {
		async function getData() {
		  const data = await fetchAllRealTimeStocks();
		  setStocksPrices(data);
		}
		getData();
  	}, []);

	const handleSearchChange = (value: string) => {
		console.log('Search Value: ', value);
		setSearchFilter(value);
	} 

	const fixData = (data: any) => {
		let finalResult = Object.entries(data).map(([stock, info]: [string, any]) => ({
			stock: stock,
			currentPrice: info.price,
			lastClosedPrice: info.previousClose,
			// volume: info.volume,
			volume: 0,
			priceProfit: [info.difference, info.differencePercent],
		}));
		return finalResult;
	}

	const marketData = fixData(StocksPrices);
	console.log("Final Data: ", marketData);
	
	return (
		<Box pt={{ base: '180px', md: '80px', xl: '80px' }}>
			
			<SimpleGrid gap='20px' mb='20px' alignContent='start'>

				<SearchBar onChange={handleSearchChange} />

				<MarketTable 
					tableData={marketData} 
				/>
				
			</SimpleGrid>

		</Box>
	);
}
