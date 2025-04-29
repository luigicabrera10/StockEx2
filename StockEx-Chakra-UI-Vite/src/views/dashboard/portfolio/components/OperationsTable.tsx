import Table from './CheckTable';

interface Operation {
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
}

function formatDate(dateString: string) {
   const date = new Date(dateString);
   const day = String(date.getUTCDate()).padStart(2, '0');
   const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
   const year = String(date.getUTCFullYear()).slice(-2); // Get last two digits of the year

   return `${day}/${month}/${year}`;
}

export default function OperationTable(props: { 
   tableData: Operation[], 
   opState: string, 
   opType: string, 
   stock: string,
   investment: number[],
   earnings: number[],
   leverage: number[],
   dates: Date[]
}) {

   let { tableData } = props;
   const { opState } = props;
   const { opType } = props;
   const { stock } = props;
   const { investment } = props;
   const { earnings } = props;
   const { leverage } = props;
   const { dates } = props;

   console.log("Table Data before: ", tableData);

   if (opState === 'active') tableData = tableData.filter((operation: Operation) => operation.closed_date === "");
   else if (opState === 'closed') tableData = tableData.filter((operation: Operation) => operation.closed_date !== "");

   if (opType === 'buy') tableData = tableData.filter((operation: Operation) => operation.opType !== true);
   else if (opType === 'sell') tableData = tableData.filter((operation: Operation) => operation.opType !== false);
   
   if (stock !== 'any') {
      tableData = tableData.filter((operation: Operation) => operation.stock === stock);
   }

   tableData = tableData.filter((operation: Operation) => investment[0] <= operation.investment && operation.investment <= investment[1]);
   tableData = tableData.filter((operation: Operation) => 
      earnings[0] <= operation.earning && operation.earning <= earnings[1]
   );
   tableData = tableData.filter((operation: Operation) => 
      leverage[0] <= operation.leverage && operation.leverage <= leverage[1]
   );

   console.log("FILTER DATES: ", dates);
   tableData = tableData.filter((operation: Operation) => 
      dates[0] <= new Date(operation.open_date) && new Date(operation.open_date) <= dates[1]
   );

   let tableData2 = tableData.map((op: Operation) => {
      return {
         stock: op.stock, 
         investment: "$ " + op.investment.toFixed(2),
         opType: op.opType ? "Sell" : "Buy",
         openPrice: "$ " + op.openPrice.toFixed(2),
         actualPrice: "$ " + op.actualPrice,
         earning: op.earning >= 0 ? ["+ $ " + Math.abs(op.earning).toFixed(2), '#1aba1a'] : ["- $ " + Math.abs(op.earning).toFixed(2),'#d62b2b'],
         open_date: formatDate(op.open_date), 
         closed_date: op.closed_date === "" ? " - " : formatDate(op.closed_date), 
         leverage: "X " + op.leverage,
         operationId: [op.closed_date === "", op.operationId]
      };
   });

   tableData2 = tableData2.reverse();
   
   console.log("Table Data after: ", tableData2);

   return (
      <Table tableData={tableData2} />
   );
}