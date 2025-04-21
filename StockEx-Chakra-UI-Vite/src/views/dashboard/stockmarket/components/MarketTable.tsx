import { Flex, Box, Table, Checkbox, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';
import * as React from 'react';

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable
} from '@tanstack/react-table';

// Custom components
import Card from '../../../../components/card/Card';
import Menu from '../../../../components/menu/MainMenu';

// StockEx imports
import StockIcon from '@/utils/data/stocks/StockIcon';
import MiniChart from '@/components/charts/MiniChart';
import { useEffect } from 'react';

// type RowObj = {
// 	name: [string, boolean];
// 	progress: string;
// 	quantity: number;
// 	date: string;
// 	info: boolean;
// };

type StockPriceInfo = {
	stock: string;
	currentPrice: number;
	lastClosedPrice: number;
	volume: number,
	priceProfit: [number, number];
	previewPrices: number[] | undefined;
};
 
const columnHelper = createColumnHelper<StockPriceInfo>();

// const columns = columnsDataCheck;
export default function MarketTable(props: { tableData: any }) {
	const { tableData } = props;
	const [ sorting, setSorting ] = React.useState<SortingState>([]);
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
	let defaultData= tableData;
	const columns = [
		columnHelper.accessor('stock', {
			id: 'stock',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					STOCK
				</Text>
			),
			cell: (info: any) => (
				<Flex flexDirection={'row'} gap='15px' alignContent='center' alignItems='center' justifyContent='start'>
					
					<StockIcon symbol={info.getValue()} height ='50px' width='50px' borderRadius='5px'/>

					<Flex alignContent='center' alignItems='center'>
						<Text color={textColor} fontSize='18px' fontWeight='700'>
							{info.getValue()}
						</Text>
					</Flex>
				</Flex>
			)
		}),
		columnHelper.accessor('currentPrice', {
			id: 'currentPrice',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					CURRENT PRICE
				</Text>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700' align='center' >
					{info.getValue()}
				</Text>
			)
		}),
		columnHelper.accessor('lastClosedPrice', {
			id: 'lastClosedPrice',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					LAST CLOSED PRICE
				</Text>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700'  align='center'>
					{info.getValue().toString()}
				</Text>
			)
		}),
		columnHelper.accessor('volume', {
			id: 'volume',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					TRADING VOLUME
				</Text>
			),
			cell: (info) => (
				<Text color={textColor} fontSize='18px' fontWeight='700'  align='center'>
					{info.getValue().toString()}
				</Text>
			)
		}),
		columnHelper.accessor('priceProfit', {
			id: 'priceProfit',
			header: () => (
				<Box>
					<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						PROFIT
					</Text>
					<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						(Daily)
					</Text>
				</Box>
			),
			cell: (info) => (
				<Box>
					<Text color={info.getValue()[0] >= 0 ? 'green' : 'red'} fontSize='18px' fontWeight='700' textAlign="center">
						{info.getValue()[0].toFixed(2)} 
					</Text>
					<Text color={info.getValue()[1] >= 0 ? 'green' : 'red'} fontSize='18px' fontWeight='700' textAlign="center">
						{'(' + info.getValue()[1].toFixed(2) + '%)'} 
					</Text>
				</Box>
			)
		}),
		columnHelper.accessor('previewPrices', {
			id: 'chart',
			header: () => (
				<Box>
					<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						CHART
					</Text>
					<Text
						justifyContent='space-between'
						align='center'
						fontSize='16px'
						color='gray.400'>
						(PAST 10 DAYS)
					</Text>
				</Box>
			),
			cell: (info) => (
				<Box display='flex' justifyContent='center' alignContent='center'>

					<MiniChart prices={ info.getValue() ?? [0.0, 0.0] } />
					{/* <Text fontSize='18px' fontWeight='700' textAlign="center">
						Chart no available yet
					</Text> */}

				</Box>
			)
		}),
		columnHelper.accessor('stock', {
			id: 'tradeButton',
			header: () => (
				<Text
					justifyContent='space-between'
					align='center'
					fontSize='16px'
					color='gray.400'>
					TRADE
				</Text>
			),
			cell: (info) => (
				<Box display='flex' justifyContent='center' alignContent='center'>

					<Text fontSize='18px' fontWeight='700' textAlign="center">
						Trade button no available yet
					</Text>


				</Box>
			)
		}),
		
	];
	const [ data, setData ] = React.useState(() => [ ...defaultData ]);

	useEffect(() => {
        setData([...tableData]);
    }, [tableData]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		debugTable: true
	});
	return (
		<Card flexDirection='column' w='100%' px='0px' overflowX={{ sm: 'scroll', lg: 'hidden' }}>
			<Flex px='25px' mt="5px" mb="8px" justifyContent='space-between' align='center'>
				<Text color={textColor} fontSize='22px' fontWeight='700' lineHeight='100%'>
					Stock Market Prices
				</Text>
				{/* <Menu /> */}
			</Flex>
			<Box>
				<Table variant='simple' color='gray.500' mb='24px' mt="12px">
					<Thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<Tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<Th
											key={header.id}
											colSpan={header.colSpan}
											pe='10px' 
											borderColor={borderColor}
											cursor='pointer'
											onClick={header.column.getToggleSortingHandler()}>
											<Flex
												justifyContent='space-around'
												align='center'
												fontSize='16px'
												color='gray.400'>
												{flexRender(header.column.columnDef.header, header.getContext())}{{
													asc: '',
													desc: '',
												}[header.column.getIsSorted() as string] ?? null}
											</Flex>
										</Th>
									);
								})}
							</Tr>
						))}
					</Thead>
					<Tbody>
						{table.getRowModel().rows.map((row) => {
							return (
								<Tr key={row.id}>
									{row.getVisibleCells().map((cell) => {
										return (
											<Td
												key={cell.id}
												fontSize={{ sm: '14px' }}
												minW={{ sm: '150px', md: '200px', lg: 'auto' }}
												borderColor='transparent'>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</Td>
										);
									})}
								</Tr>
							);
						})}
					</Tbody>
				</Table>
			</Box>
		</Card>
	);
} 