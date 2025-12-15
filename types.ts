export enum FoodType {
  PIZZA = "Pizza",
  BURGER = "Hambúrguer",
  SUSHI = "Sushi",
  DESSERT = "Doces e sobremesas",
  DRINKS = "Bebidas",
  HOT_DISH = "Pratos quentes",
  FAST_FOOD = "Fast food",
  PASTA = "Massas",
  ARTISAN = "Lanches artesanais",
  PASTRY = "Pastelaria"
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "4:5",
  STORY = "9:16",
  LANDSCAPE = "16:9"
}

export enum PaymentStatus {
  IDLE = "IDLE",
  PENDING = "PENDING", // User is looking at Pix screen
  VALIDATING = "VALIDATING", // AI is checking receipt
  PAID = "PAID",
  ERROR = "ERROR"
}

export interface EnhancementOption {
  id: string;
  label: string;
  selected: boolean;
}

export interface AppState {
  imageFile: File | null;
  imagePreviewUrl: string | null;
  selectedFoodType: FoodType | "";
  aspectRatio: AspectRatio;
  enhancements: EnhancementOption[];
  userDescription: string;
  
  // Payment State
  paymentStatus: PaymentStatus;
  proofFile: File | null;
  proofPreviewUrl: string | null;
  paymentErrorMessage: string | null;

  // Processing State
  isProcessing: boolean;
  isComplete: boolean;
  generatedPrompt: string;
  resultImageUrl: string | null;
}

export const DEFAULT_ENHANCEMENTS: EnhancementOption[] = [
  { id: 'lighting', label: 'Iluminação profissional de estúdio', selected: true },
  { id: 'colors', label: 'Cores mais vivas e naturais', selected: true },
  { id: 'background', label: 'Fundo sofisticado e desfocado', selected: true },
  { id: 'editorial', label: 'Estilo editorial gastronômico', selected: true },
  { id: 'texture', label: 'Realce de textura, brilho e frescor', selected: true },
  { id: 'structure', label: 'Manter o produto sem alterações estruturais', selected: true }, // Mandatory logic wise, but let user see it
];