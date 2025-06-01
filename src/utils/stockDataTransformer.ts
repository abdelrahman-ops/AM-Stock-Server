import { Stock } from '../draft/stock.model';

export const transformMockStockData = (mockData: any) => {
  return Object.entries(mockData).map(([symbol, stockData]: [string, any]) => ({
    symbol,
    name: stockData.name,
    exchange: 'EGX',
    currentPrice: {
      last: parseFloat(stockData.close),
      change: parseFloat(stockData.change),
      percentChange: parseFloat(stockData.percent_change),
      lastUpdated: new Date(),
    },
    today: {
      open: parseFloat(stockData.close) - parseFloat(stockData.change), // Approximate open
      high: parseFloat(stockData.high),
      low: parseFloat(stockData.low),
      volume: parseInt(stockData.volume.replace(/,/g, '')),
    },
    fiftyTwoWeek: {
      high: parseFloat(stockData.fifty_two_week.high),
      low: parseFloat(stockData.fifty_two_week.low),
      high_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      low_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    },
    sector: 'Financial', // Default sector, should be updated with real data
    industry: 'Banking', // Default industry, should be updated with real data
    isActive: true,
  }));
};

export const seedDatabase = async (mockData: any) => {
  try {
    const stocksData = transformMockStockData(mockData);
    await Stock.deleteMany({}); // Clear existing data
    await Stock.insertMany(stocksData);
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};