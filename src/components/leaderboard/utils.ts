
import { EquipmentType } from '@/types/growRoom';

// Helper to format growth time
export const formatGrowTime = (ms: number) => {
  if (ms === 0) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

// Helper to shorten wallet address
export const shortenAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format value for tooltips
export const formatTooltipValue = (value: any, name: string, props: any) => {
  if (typeof value === 'number') {
    return [value.toFixed(1), name];
  }
  return [value, name];
};

// Generate mock activity data for demo
export const generateActivityData = () => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    data.push({
      date: date.toLocaleDateString(),
      plants: Math.floor(Math.random() * 10),
      thc: Math.floor(Math.random() * 100)
    });
  }
  return data;
};

// Generate equipment comparison data
export const generateEquipmentComparisonData = () => {
  return [
    { 
      type: EquipmentType.Light, 
      'You': 3, 
      'Top Player': 5, 
      'Average': 2 
    },
    { 
      type: EquipmentType.Pot, 
      'You': 2, 
      'Top Player': 4, 
      'Average': 2 
    },
    { 
      type: EquipmentType.Nutrients, 
      'You': 4, 
      'Top Player': 5, 
      'Average': 3 
    },
    { 
      type: EquipmentType.Ventilation, 
      'You': 1, 
      'Top Player': 3, 
      'Average': 1 
    },
    { 
      type: EquipmentType.Automation, 
      'You': 2, 
      'Top Player': 4, 
      'Average': 2 
    }
  ];
};

// Generate equipment chart data
export const generateEquipmentChartData = () => {
  return [
    {
      name: 'Light',
      'Level 1': 40,
      'Level 2': 30,
      'Level 3': 20,
      'Level 4': 10,
      'Level 5': 5,
    },
    {
      name: 'Pot',
      'Level 1': 50,
      'Level 2': 25,
      'Level 3': 15,
      'Level 4': 8,
      'Level 5': 2,
    },
    {
      name: 'Nutrients',
      'Level 1': 35,
      'Level 2': 28,
      'Level 3': 22,
      'Level 4': 12,
      'Level 5': 3,
    },
    {
      name: 'Ventilation',
      'Level 1': 60,
      'Level 2': 20,
      'Level 3': 12,
      'Level 4': 6,
      'Level 5': 2,
    },
    {
      name: 'Automation',
      'Level 1': 45,
      'Level 2': 25,
      'Level 3': 18,
      'Level 4': 10,
      'Level 5': 2,
    },
  ];
};

// Generate top producers data
export const generateTopProducersData = () => {
  return [
    { name: 'Player 1', value: 35 },
    { name: 'Player 2', value: 25 },
    { name: 'Player 3', value: 15 },
    { name: 'Player 4', value: 10 },
    { name: 'Others', value: 15 },
  ];
};

// Generate quality vs growth time data
export const generateQualityVsTimeData = () => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push({
      id: `Plant ${i + 1}`,
      quality: 5 + Math.random() * 5,
      growTime: 10 + Math.random() * 20,
      thc: 50 + Math.random() * 50
    });
  }
  return data;
};
