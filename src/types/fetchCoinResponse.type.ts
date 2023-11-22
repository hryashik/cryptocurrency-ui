export type FetchCoinApiResponse = {
   Data: {
      [key: string]: {
         id: string,
         ImageUrl: string,
         Symbol: string,
         FullName: string
      }
   }
}