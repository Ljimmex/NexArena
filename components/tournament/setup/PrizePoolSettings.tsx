import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { DollarSign, Trophy, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PrizePoolSettingsProps {
  prizePool: string;
  setPrizePool: (value: string) => void;
  prizeDistribution: string;
  setPrizeDistribution: (value: string) => void;
  customPrizeDistribution: Record<string, number>;
  setCustomPrizeDistribution: (value: Record<string, number>) => void;
  teamCount: number;
}

export default function PrizePoolSettings({
  prizePool,
  setPrizePool,
  prizeDistribution,
  setPrizeDistribution,
  customPrizeDistribution,
  setCustomPrizeDistribution,
  teamCount
}: PrizePoolSettingsProps) {
  const [isCustomDistributionOpen, setIsCustomDistributionOpen] = useState(false);
  const [remainingPercentage, setRemainingPercentage] = useState(0);

  // Stan dla nagród rzeczowych
  const [materialPrizes, setMaterialPrizes] = useState<
    { name: string; place: string; quantity: number; image?: string }[]
  >([]);
  const [newMaterialPrize, setNewMaterialPrize] = useState<string>("");
  const [newMaterialPrizePlace, setNewMaterialPrizePlace] = useState<string>("1");
  const [newMaterialPrizeQuantity, setNewMaterialPrizeQuantity] = useState<number>(1);
  const [newMaterialPrizeImage, setNewMaterialPrizeImage] = useState<string>("");

  // Oblicz pozostały procent dla niestandardowej dystrybucji
  useEffect(() => {
    if (prizeDistribution === "custom") {
      const totalAllocated = Object.values(customPrizeDistribution).reduce((sum, value) => sum + value, 0);
      setRemainingPercentage(100 - totalAllocated);
    }
  }, [customPrizeDistribution, prizeDistribution]);

  // Funkcja do aktualizacji niestandardowej dystrybucji
  const updateCustomDistribution = (place: string, value: number) => {
    setCustomPrizeDistribution({
      ...customPrizeDistribution,
      [place]: value
    });
  };

  // Funkcja do generowania miejsc na podstawie liczby drużyn
  const generatePlaces = () => {
    const places = [];
    for (let i = 1; i <= teamCount; i++) {
      places.push(i.toString());
    }
    return places;
  };

  // Funkcja do obliczania nagrody dla danego miejsca
  const calculatePrize = (place: string) => {
    if (!prizePool || isNaN(parseFloat(prizePool.replace(/[^0-9.]/g, '')))) {
      return "0 zł";
    }
    const poolValue = parseFloat(prizePool.replace(/[^0-9.]/g, ''));
    
    switch (prizeDistribution) {
      case "winner-takes-all":
        return place === "1" ? `${poolValue.toFixed(2)} zł` : "0 zł";
      
      case "50-percent-rule":
        if (place === "1") return `${(poolValue * 0.5).toFixed(2)} zł`;
        if (place === "2") return `${(poolValue * 0.25).toFixed(2)} zł`;
        if (place === "3" || place === "4") return `${(poolValue * 0.125).toFixed(2)} zł`;
        return "0 zł";
      
      case "long-tail":
        if (place === "1") return `${(poolValue * 0.5).toFixed(2)} zł`;
        if (place === "2") return `${(poolValue * 0.25).toFixed(2)} zł`;
        if (place === "3") return `${(poolValue * 0.15).toFixed(2)} zł`;
        if (place === "4") return `${(poolValue * 0.1).toFixed(2)} zł`;
        return "0 zł";
      
      case "everybody-wins":
        const equalShare = poolValue / teamCount;
        return `${equalShare.toFixed(2)} zł`;
      
      case "custom":
        const percentage = customPrizeDistribution[place] || 0;
        return `${(poolValue * percentage / 100).toFixed(2)} zł`;
      
      default:
        return "0 zł";
    }
  };

  // Funkcja formatująca miejsce
  const formatPlace = (place: string) => {
    if (place === "1") return "1st";
    if (place === "2") return "2nd";
    if (place === "3") return "3rd";
    return `${place}th`;
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Całkowita pula nagród */}
        <div className="space-y-4 p-4 border border-[#333] rounded-md bg-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h4 className="font-medium">Całkowita pula nagród</h4>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prizePool">Wartość puli nagród</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 font-bold select-none">PLN</span>
              <Input
                id="prizePool"
                type="text"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                className="pl-10 bg-[#252525] border-[#333] text-white"
                placeholder="1000"
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-400 mt-2">
            Liczba drużyn w turnieju: <span className="font-medium text-white">{teamCount}</span>
          </div>
        </div>

        {/* Sposób dystrybucji */}
        <div className="space-y-4 p-4 border border-[#333] rounded-md bg-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h4 className="font-medium">Sposób dystrybucji</h4>
          </div>
          
          <RadioGroup 
            value={prizeDistribution} 
            onValueChange={setPrizeDistribution}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="winner-takes-all" id="winner-takes-all" />
              <Label htmlFor="winner-takes-all" className="cursor-pointer">Winner takes all</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60 text-xs">Zwycięzca otrzymuje całą pulę nagród. Najlepsze rozwiązanie dla turniejów 1v1.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="50-percent-rule" id="50-percent-rule" />
              <Label htmlFor="50-percent-rule" className="cursor-pointer">The 50% rule</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60 text-xs">Zwycięzca otrzymuje 50% puli, drugi 25%, a półfinaliści po 12.5%.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="long-tail" id="long-tail" />
              <Label htmlFor="long-tail" className="cursor-pointer">The Long Tail</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60 text-xs">Zwycięzca otrzymuje 50%, drugi 25%, trzeci 15%, czwarty 10%.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="everybody-wins" id="everybody-wins" />
              <Label htmlFor="everybody-wins" className="cursor-pointer">Everybody wins!</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60 text-xs">Każda drużyna otrzymuje równą część puli nagród.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="cursor-pointer">Make your own</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60 text-xs">Stwórz własny system dystrybucji nagród.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Podgląd dystrybucji nagród */}
      <div className="space-y-4 p-4 border border-[#333] rounded-md bg-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h4 className="font-medium">Podgląd dystrybucji nagród</h4>
          </div>
          
          {prizeDistribution === "custom" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCustomDistributionOpen(!isCustomDistributionOpen)}
              className="bg-[#252525] border-[#444] hover:bg-[#333]"
            >
              {isCustomDistributionOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Ukryj ustawienia
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Dostosuj dystrybucję
                </>
              )}
            </Button>
          )}
        </div>
        
        {prizeDistribution === "custom" && isCustomDistributionOpen && (
          <div className="space-y-4 mt-4 p-4 border border-[#444] rounded-md bg-[#252525]">
            <div className="flex justify-between items-center">
              <h5 className="text-sm font-medium">Niestandardowa dystrybucja</h5>
              <div className={`text-sm ${remainingPercentage < 0 ? 'text-red-500' : remainingPercentage > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                Pozostało: {remainingPercentage}%
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatePlaces().map((place) => (
                <div key={place} className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor={`place-${place}`}>Miejsce {place}</Label>
                    <span className="text-sm">{customPrizeDistribution[place] || 0}%</span>
                  </div>
                  <Slider
                    id={`place-${place}`}
                    min={0}
                    max={100}
                    step={1}
                    value={[customPrizeDistribution[place] || 0]}
                    onValueChange={(value) => updateCustomDistribution(place, value[0])}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            
            {remainingPercentage < 0 && (
              <div className="text-red-500 text-sm">
                Suma procentów przekracza 100%. Zmniejsz wartości, aby suma wynosiła dokładnie 100%.
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-400 pb-2 border-b border-[#333]">
            <div>Miejsce</div>
            <div>Procent</div>
            <div>Nagroda</div>
          </div>
          
          {generatePlaces().map((place) => {
            let percentage = 0;
            
            switch (prizeDistribution) {
              case "winner-takes-all":
                percentage = place === "1" ? 100 : 0;
                break;
              case "50-percent-rule":
                if (place === "1") percentage = 50;
                else if (place === "2") percentage = 25;
                else if (place === "3" || place === "4") percentage = 12.5;
                break;
              case "long-tail":
                if (place === "1") percentage = 50;
                else if (place === "2") percentage = 25;
                else if (place === "3") percentage = 15;
                else if (place === "4") percentage = 10;
                break;
              case "everybody-wins":
                percentage = 100 / teamCount;
                break;
              case "custom":
                percentage = customPrizeDistribution[place] || 0;
                break;
            }
            
            return (
              <div key={place} className="grid grid-cols-3 gap-2 py-2 border-b border-[#333]">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center mr-2">
                    {place}
                  </div>
                  <span>{formatPlace(place)}</span>
                </div>
                <div>{percentage.toFixed(1)}%</div>
                <div className="font-medium text-green-500">{calculatePrize(place)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nagrody rzeczowe */}
      <div className="space-y-4 p-4 border border-[#333] rounded-md bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h4 className="font-medium">Nagrody rzeczowe</h4>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            type="text"
            placeholder="Dodaj nagrodę rzeczową (np. myszka, koszulka...)"
            value={newMaterialPrize}
            onChange={(e) => setNewMaterialPrize(e.target.value)}
            className="bg-[#252525] border-[#333] text-white"
          />
          <select
            value={newMaterialPrizePlace}
            onChange={(e) => setNewMaterialPrizePlace(e.target.value)}
            className="bg-[#252525] border-[#333] text-white rounded-md px-2"
          >
            {generatePlaces().map((place) => (
              <option key={place} value={place}>
                Miejsce {place}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={1}
            value={newMaterialPrizeQuantity}
            onChange={(e) => setNewMaterialPrizeQuantity(Number(e.target.value))}
            className="bg-[#252525] border-[#333] text-white w-20"
            placeholder="Ilość"
          />
          <Input
            type="text"
            placeholder="URL zdjęcia (opcjonalnie)"
            value={newMaterialPrizeImage}
            onChange={(e) => setNewMaterialPrizeImage(e.target.value)}
            className="bg-[#252525] border-[#333] text-white"
          />
          <Button
            onClick={() => {
              if (newMaterialPrize.trim() !== "") {
                setMaterialPrizes([
                  ...materialPrizes,
                  {
                    name: newMaterialPrize.trim(),
                    place: newMaterialPrizePlace,
                    quantity: newMaterialPrizeQuantity,
                    image: newMaterialPrizeImage.trim() || undefined,
                  },
                ]);
                setNewMaterialPrize("");
                setNewMaterialPrizePlace("1");
                setNewMaterialPrizeQuantity(1);
                setNewMaterialPrizeImage("");
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Dodaj
          </Button>
        </div>
        {materialPrizes.length > 0 ? (
          <ul className="space-y-2 mt-2">
            {materialPrizes.map((prize, idx) => (
              <li key={idx} className="flex items-center justify-between bg-[#252525] p-2 rounded-md">
                <div className="flex items-center gap-3">
                  {prize.image && (
                    <img src={prize.image} alt={prize.name} className="w-10 h-10 object-cover rounded" />
                  )}
                  <span>
                    <b>{prize.name}</b> (Miejsce: {prize.place}, Ilość: {prize.quantity})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                  onClick={() => setMaterialPrizes(materialPrizes.filter((_, i) => i !== idx))}
                >
                  Usuń
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 mt-2">
            Brak dodanych nagród rzeczowych
          </p>
        )}
      </div>
    </div>
  );
}
