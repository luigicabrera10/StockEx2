// Chakra Imports
import {
	Avatar,
	Button,
	Flex,
	Icon,
	Image,
	Link,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Box,
	Text,
	useColorModeValue,
	useColorMode
} from '@chakra-ui/react';
// Custom Components
import { ItemContent } from '../../components/menu/ItemContent';
import { SearchBar } from '../../components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from '../../components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React from 'react';
// Assets
import navImage from '../../assets/images/layout/Navbar.png';
import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { FaEthereum } from 'react-icons/fa';
import routes from '../../routes';

import { useApi, useAccount, useBalance, useBalanceFormat } from '@gear-js/react-hooks';
import { useState } from 'react';
// import { AccountsModal } from '../../components/layout/header/account-info/accounts-modal';
// import { AccountButton } from '../../components/layout/header/account-info/account-button';
import { Wallet } from '@gear-js/wallet-connect';

import VaraLogo from '/src/assets/images/vara/vara_logo.png';


export default function HeaderLinks(props: { secondary: boolean }) {
	const { secondary } = props;
	const { colorMode, toggleColorMode } = useColorMode();
	// Chakra Color Mode
	const navbarIcon = useColorModeValue('gray.400', 'white');
	let menuBg = useColorModeValue('white', 'navy.800');
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorBrand = useColorModeValue('brand.700', 'brand.400');
	const ethColor = useColorModeValue('gray.700', 'white');
	const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
	const ethBg = useColorModeValue('secondaryGray.300', 'navy.900');
	const ethBox = useColorModeValue('white', 'navy.800');
	const shadow = useColorModeValue(
		'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
		'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	);
	const borderButton = useColorModeValue('secondaryGray.500', 'whiteAlpha.200');

	const { account, accounts } = useAccount();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { balance } = useBalance(account?.address);
	const { getFormattedBalance } = useBalanceFormat();

	const formattedBalance = balance ? getFormattedBalance(balance) : {value: '0.00', unit: 'TVARA'};
	const varaBalance = parseFloat(formattedBalance.value).toFixed(4);


	const openModal = () => {
		setIsModalOpen(true);
	 };
  
	const closeModal = () => {
		setIsModalOpen(false);
	};

	return (
		<Flex
			w={{ sm: '100%', md: 'auto' }}
			alignItems='center'
			flexDirection='row'
			bg={menuBg}
			flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
			p='10px'
			borderRadius='30px'
			boxShadow={shadow}>
			{/* <SearchBar
				mb={() => {
					if (secondary) {
						return { base: '10px', md: 'unset' };
					}
					return 'unset';
				}}
				me='10px'
				borderRadius='30px'
			/> */}

			<Box marginLeft='10px'></Box>


			
			<SidebarResponsive routes={routes} />

			{/* <Menu>
				<MenuButton p='0px'>
					<Icon mt='6px' as={MdNotificationsNone} color={navbarIcon} w='18px' h='18px' me='10px' />
				</MenuButton>
				<MenuList
					boxShadow={shadow}
					p='20px'
					borderRadius='20px'
					bg={menuBg}
					border='none'
					mt='22px'
					me={{ base: '30px', md: 'unset' }}
					minW={{ base: 'unset', md: '400px', xl: '450px' }}
					maxW={{ base: '360px', md: 'unset' }}>
					<Flex w='100%' mb='20px'>
						<Text fontSize='md' fontWeight='600' color={textColor}>
							Notifications
						</Text>
						<Text fontSize='sm' fontWeight='500' color={textColorBrand} ms='auto' cursor='pointer'>
							Mark all read
						</Text>
					</Flex>
					<Flex flexDirection='column'>
						<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} px='0' borderRadius='8px' mb='10px'>
							<ItemContent info='Horizon UI Dashboard PRO' />
						</MenuItem>
						<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} px='0' borderRadius='8px' mb='10px'>
							<ItemContent info='Horizon Design System Free' />
						</MenuItem>
					</Flex>
				</MenuList>
			</Menu>

			<Menu>
				<MenuButton p='0px'>
					<Icon mt='6px' as={MdInfoOutline} color={navbarIcon} w='18px' h='18px' me='10px' />
				</MenuButton>
				<MenuList
					boxShadow={shadow}
					p='20px'
					me={{ base: '30px', md: 'unset' }}
					borderRadius='20px'
					bg={menuBg}
					border='none'
					mt='22px'
					minW={{ base: 'unset' }}
					maxW={{ base: '360px', md: 'unset' }}>
					<Image src={navImage} borderRadius='16px' mb='28px' />
					<Flex flexDirection='column'>
						<Link w='100%' href='https://horizon-ui.com/pro'>
							<Button w='100%' h='44px' mb='10px' variant='brand'>
								Buy Horizon UI PRO
							</Button>
						</Link>
						<Link w='100%' href='https://horizon-ui.com/documentation/docs/introduction'>
							<Button
								w='100%'
								h='44px'
								mb='10px'
								border='1px solid'
								bg='transparent'
								borderColor={borderButton}>
								See Documentation
							</Button>
						</Link>
						<Link w='100%' href='https://github.com/horizon-ui/horizon-ui-chakra-ts'>
							<Button w='100%' h='44px' variant='no-hover' color={textColor} bg='transparent'>
								Try Horizon Free
							</Button>
						</Link>
					</Flex>
				</MenuList>
			</Menu> */}


			<Button
				variant='no-hover'
				bg='transparent'
				p='0px'
				minW='unset'
				minH='unset'
				h='18px'
				w='max-content'
				onClick={toggleColorMode}>
				<Icon
					me='0px'
					h='18px'
					w='18px'
					color={navbarIcon}
					as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
				/>
			</Button>


			<Flex
				bg={ethBg}
				display={secondary ? 'flex' : 'none'}
				borderRadius='30px'
				ms='auto'
				p='6px'
				align='center'
				me='6px'
				marginX='10px'>
				<Flex align='center' justify='center' bg={ethBox} h='29px' w='29px' borderRadius='30px' me='7px'>
					<img src={VaraLogo} alt="Vara Logo" style={{ width: 'auto', height: '20px' }}/>
				</Flex>
				<Text w='max-content' color={ethColor} fontSize='15px' fontWeight='700' me='6px'>
					{varaBalance}
					<Text as='span' fontSize='15px' display={{ base: 'none', md: 'unset' }}>
						{' '}
						TVARA
					</Text>
				</Text>
			</Flex>


			{/* <Menu>
				<MenuButton p='0px'>
					<Avatar
						_hover={{ cursor: 'pointer' }}
						color='white'
						name='Adela Parkson'
						bg='#11047A'
						size='sm'
						w='40px'
						h='40px'
					/>
				</MenuButton>
				<MenuList boxShadow={shadow} p='0px' mt='10px' borderRadius='20px' bg={menuBg} border='none'>
					<Flex w='100%' mb='0px'>
						<Text
							ps='20px'
							pt='16px'
							pb='10px'
							w='100%'
							borderBottom='1px solid'
							borderColor={borderColor}
							fontSize='sm'
							fontWeight='700'
							color={textColor}>
							👋&nbsp; Hey, Adela
						</Text>
					</Flex>
					<Flex flexDirection='column' p='10px'>
						<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} borderRadius='8px' px='14px'>
							<Text fontSize='sm'>Profile Settings</Text>
						</MenuItem>
						<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} borderRadius='8px' px='14px'>
							<Text fontSize='sm'>Newsletter Settings</Text>
						</MenuItem>
						<MenuItem
							_hover={{ bg: 'none' }}
							_focus={{ bg: 'none' }}
							color='red.400'
							borderRadius='8px'
							px='14px'>
							<Text fontSize='sm'>Log out</Text>
						</MenuItem>
					</Flex>
				</MenuList>
				
				
			</Menu> */}


			{/* {account ? (
				<AccountButton address={account.address} name={account.meta.name} onClick={openModal} />
			) : (
				// <Button  text="Sign in" onClick={openModal} />
				<Button onClick={openModal} > Sign in </Button>
			)} */}

			{/* <AccountButton address={account.address} name={account.meta.name} onClick={openModal} /> */}
			{/* {isModalOpen && <AccountsModal accounts={accounts} close={closeModal} />} */}

			<Wallet theme='vara'/>

			<Box marginLeft='10px'></Box>

		</Flex>
	);
}

HeaderLinks.propTypes = {
	variant: PropTypes.string,
	fixed: PropTypes.bool,
	secondary: PropTypes.bool,
	onOpen: PropTypes.func
};