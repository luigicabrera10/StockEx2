import React from 'react';

// Import all icons
import AAPL from '@/assets/images/stockIcons/AAPL.jpeg'
import MSFT from '@/assets/images/stockIcons/MSFT.jpeg'
import NVDA from '@/assets/images/stockIcons/NVDA.jpeg'
import GOOGL from '@/assets/images/stockIcons/GOOGL.jpeg'
import AMZN from '@/assets/images/stockIcons/AMZN.jpeg'
import META from '@/assets/images/stockIcons/META.jpeg'
import TSM from '@/assets/images/stockIcons/TSM.jpeg'
import LLY from '@/assets/images/stockIcons/LLY.jpeg'
import AVGO from '@/assets/images/stockIcons/AVGO.jpeg'
import TSLA from '@/assets/images/stockIcons/TSLA.jpeg'
import JPM from '@/assets/images/stockIcons/JPM.jpeg'
import WMT from '@/assets/images/stockIcons/WMT.jpeg'
import SONY from '@/assets/images/stockIcons/SONY.jpeg'
import XOM from '@/assets/images/stockIcons/XOM.jpeg'
import UNH from '@/assets/images/stockIcons/UNH.jpeg'
import V from '@/assets/images/stockIcons/V.jpeg'
import NVO from '@/assets/images/stockIcons/NVO.jpeg'
import MA from '@/assets/images/stockIcons/MA.jpeg'
import PG from '@/assets/images/stockIcons/PG.jpeg'
import ORCL from '@/assets/images/stockIcons/ORCL.jpeg'
import JNJ from '@/assets/images/stockIcons/JNJ.jpeg'
import COST from '@/assets/images/stockIcons/COST.jpeg'
import HD from '@/assets/images/stockIcons/HD.jpeg'
import BAC from '@/assets/images/stockIcons/BAC.jpeg'
import MRK from '@/assets/images/stockIcons/MRK.jpeg'
import ABBV from '@/assets/images/stockIcons/ABBV.jpeg'
import CVX from '@/assets/images/stockIcons/CVX.jpeg'
import KO from '@/assets/images/stockIcons/KO.jpeg'
import SMFG from '@/assets/images/stockIcons/SMFG.jpeg'
import NFLX from '@/assets/images/stockIcons/NFLX.jpeg'
import TM from '@/assets/images/stockIcons/TM.jpeg'
import AZN from '@/assets/images/stockIcons/AZN.jpeg'
import SAP from '@/assets/images/stockIcons/SAP.jpeg'
import CRM from '@/assets/images/stockIcons/CRM.jpeg'
import ADBE from '@/assets/images/stockIcons/ADBE.jpeg'
import AMD from '@/assets/images/stockIcons/AMD.jpeg'
import PEP from '@/assets/images/stockIcons/PEP.jpeg'
import NVS from '@/assets/images/stockIcons/NVS.jpeg'
import ACN from '@/assets/images/stockIcons/ACN.jpeg'
import TMO from '@/assets/images/stockIcons/TMO.jpeg'
import LIN from '@/assets/images/stockIcons/LIN.jpeg'
import TMUS from '@/assets/images/stockIcons/TMUS.jpeg'
import WFC from '@/assets/images/stockIcons/WFC.jpeg'
import QCOM from '@/assets/images/stockIcons/QCOM.jpeg'
import DHR from '@/assets/images/stockIcons/DHR.jpeg'
import CSCO from '@/assets/images/stockIcons/CSCO.jpeg'
import PYPL from '@/assets/images/stockIcons/PYPL.jpeg'
import BABA from '@/assets/images/stockIcons/BABA.jpeg'
import IBM from '@/assets/images/stockIcons/IBM.jpeg'
import INTC from '@/assets/images/stockIcons/INTC.jpeg'

// Mapping stock symbols to icons
const stockIcons: { [key: string]: string } = {
   AAPL,
   MSFT,
   NVDA,
   GOOGL,
   AMZN,
   META,
   TSM,
   LLY,
   AVGO,
   TSLA,
   JPM,
   WMT,
   SONY,
   XOM,
   UNH,
   V,
   NVO,
   MA,
   PG,
   ORCL,
   JNJ,
   COST,
   HD,
   BAC,
   MRK,
   ABBV,
   CVX,
   KO,
   SMFG,
   NFLX,
   TM,
   AZN,
   SAP,
   CRM,
   ADBE,
   AMD,
   PEP,
   NVS,
   ACN,
   TMO,
   LIN,
   TMUS,
   WFC,
   QCOM,
   DHR,
   CSCO,
   PYPL,
   BABA,
   IBM,
   INTC,
};

type StockIconProps = {
   symbol: string;
   width?: string | number;
   height?: string | number;
   borderRadius?: string | number;
 };
 
 const StockIcon: React.FC<StockIconProps> = ({ symbol, width = '50px', height = '50px', borderRadius = '0px' }) => {
   const icon = stockIcons[symbol];
   
   
   if (!icon) {
     return <span>Icon not found: {symbol}</span>;
   }
 
   return <img src={icon} alt={`${symbol} icon`} width={width} height={height} border-radio='5px' style={{ borderRadius }}/>;
 };
 
 export default StockIcon;