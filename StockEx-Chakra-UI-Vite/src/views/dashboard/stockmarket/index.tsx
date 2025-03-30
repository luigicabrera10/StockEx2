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

import React, { useState } from 'react';

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



export default function Marketplace() {
	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorBrand = useColorModeValue('brand.500', 'white');

	// Search filter var
	const [SearchFilter, setSearchFilter] = useState<string>('');

	const handleSearchChange = (value: string) => {
		console.log('Search Value: ', value);
		setSearchFilter(value);
	} 

	const getMarketData = () => {

		return [
			{
				stock: 'AAPL',
				currentPrice: 150.00,
				lastClosedPrice: 178.00,
				volume: 800000,
				priceProfit: [125, 1.50],
				trade: true,				
			},
			{
				stock: 'TSLA',
				currentPrice: 180.00,
				lastClosedPrice: 150.00,
				volume: 400000,
				priceProfit: [253, 1.50],
				trade: true,				
			},
			{
				stock: 'MSFT',
				currentPrice: 280.00,
				lastClosedPrice: 275.00,
				volume: 1200000,
				priceProfit: [300, 1.80],
				trade: true,
			},
			{
				stock: 'GOOGL',
				currentPrice: 2700.00,
				lastClosedPrice: 2650.00,
				volume: 900000,
				priceProfit: [2750, 2.00],
				trade: true,
			},
			{
				stock: 'NVDA',
				currentPrice: 220.00,
				lastClosedPrice: 210.00,
				volume: 600000,
				priceProfit: [230, 1.40],
				trade: true,
			},
			{
				stock: 'AMZN',
				currentPrice: 3400.00,
				lastClosedPrice: 3300.00,
				volume: 1100000,
				priceProfit: [3450, 2.50],
				trade: true,
			},
			{
				stock: 'META',
				currentPrice: 320.00,
				lastClosedPrice: 310.00,
				volume: 700000,
				priceProfit: [330, 1.20],
				trade: true,
			},
			{
				stock: 'NFLX',
				currentPrice: 500.00,
				lastClosedPrice: 480.00,
				volume: 500000,
				priceProfit: [510, 1.80],
				trade: true,
			},
			{
				stock: 'TSM',
				currentPrice: 120.00,
				lastClosedPrice: 115.00,
				volume: 800000,
				priceProfit: [125, 1.30],
				trade: true,
			},
			{
				stock: 'JPM',
				currentPrice: 150.00,
				lastClosedPrice: 145.00,
				volume: 400000,
				priceProfit: [155, 1.10],
				trade: true,
			},
			{
				stock: 'XOM',
				currentPrice: 100.00,
				lastClosedPrice: 95.00,
				volume: 300000,
				priceProfit: [105, 1.20],
				trade: true,
			},
			{
				stock: 'UNH',
				currentPrice: 450.00,
				lastClosedPrice: 440.00,
				volume: 200000,
				priceProfit: [460, 1.50],
				trade: true,
			},
			{
				stock: 'V',
				currentPrice: 230.00,
				lastClosedPrice: 225.00,
				volume: 350000,
				priceProfit: [235, 1.10],
				trade: true,
			},
			{
				stock: 'MA',
				currentPrice: 370.00,
				lastClosedPrice: 360.00,
				volume: 250000,
				priceProfit: [380, 1.30],
				trade: true,
			},
			{
				stock: 'PEP',
				currentPrice: 160.00,
				lastClosedPrice: 155.00,
				volume: 450000,
				priceProfit: [165, 1.20],
				trade: true,
			},
			{
				stock: 'KO',
				currentPrice: 60.00,
				lastClosedPrice: 58.00,
				volume: 500000,
				priceProfit: [62, 1.10],
				trade: true,
			},
			{
				stock: 'INTC',
				currentPrice: 50.00,
				lastClosedPrice: 48.00,
				volume: 600000,
				priceProfit: [52, 1.20],
				trade: true,
			},
			{
				stock: 'AMD',
				currentPrice: 110.00,
				lastClosedPrice: 105.00,
				volume: 700000,
				priceProfit: [115, 1.30],
				trade: true,
			},
			{
				stock: 'CRM',
				currentPrice: 250.00,
				lastClosedPrice: 240.00,
				volume: 400000,
				priceProfit: [260, 1.50],
				trade: true,
			},
			{
				stock: 'ORCL',
				currentPrice: 90.00,
				lastClosedPrice: 85.00,
				volume: 300000,
				priceProfit: [95, 1.20],
				trade: true,
			}
		];
	}

	const marketData = getMarketData();

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
