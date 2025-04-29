import { Icon } from '@chakra-ui/react';
import { MdBarChart, MdPerson, MdHome, MdLock, MdOutlineShoppingCart, MdShowChart } from 'react-icons/md';

// Admin Imports
// import MainDashboard from './views/dashboard/default';
// import NFTMarketplace from './views/dashboard/marketplace';
// import Profile from './views/dashboard/profile';
// import DataTables from './views/dashboard/dataTables';

// Auth Imports
// import SignInCentered from './views/home/signIn';

// StockEx imports
import StockMarket from './views/dashboard/stockmarket';
import StockCharts from './views/dashboard/stockCharts';
import Portfolio from './views/dashboard/portfolio';

const routes = [
	{
		name: 'Main Dashboard',
		layout: '/dashboard',
		path: '/default',
		icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
		component: Portfolio,
	},
	// {
	// 	name: 'NFT Marketplace',
	// 	layout: '/dashboard',
	// 	path: '/nft-marketplace',
	// 	icon: <Icon as={MdOutlineShoppingCart} width='20px' height='20px' color='inherit' />,
	// 	component: NFTMarketplace,
	// 	secondary: true
	// },
	// {
	// 	name: 'Data Tables',
	// 	layout: '/dashboard',
	// 	icon: <Icon as={MdBarChart} width='20px' height='20px' color='inherit' />,
	// 	path: '/data-tables',
	// 	component: DataTables,
	// },
	// {
	// 	name: 'Profile',
	// 	layout: '/dashboard',
	// 	path: '/profile',
	// 	icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
	// 	component: Profile,
	// },
	// {
	// 	name: 'Sign In',
	// 	layout: '/home',
	// 	path: '/sign-in',
	// 	icon: <Icon as={MdLock} width='20px' height='20px' color='inherit' />,
	// 	component: SignInCentered,
	// },


	// Stock Ex routes
	{
		name: 'Stock Market',
		layout: '/dashboard',
		path: '/stock-market',
		icon: <Icon as={MdOutlineShoppingCart} width='20px' height='20px' color='inherit' />,
		component: StockMarket,
		secondary: false
	},
	{
		name: 'Stock Chart',
		layout: '/dashboard',
		path: '/stock-chart',
		icon: <Icon as={MdShowChart} width='20px' height='20px' color='inherit' />,
		component: StockCharts,
		secondary: false
	},

];

export default routes;
