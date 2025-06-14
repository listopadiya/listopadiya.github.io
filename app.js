let constantsData = [];
let constantsByType = { pot: new Map(), species: new Map(), season: new Map() };
let dataset = [];

// Function to fetch and process data from 'data.json'
async function fetchData() {
  if (dataset.length > 0) return dataset;
  try {
    const res = await fetch('data.json');
    dataset = await res.json();
    return dataset;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

// Function to fetch and process constants from 'constants.json'
async function fetchConstants() {
  if (constantsData.length > 0) return constantsData;
  try {
    const res = await fetch('constants.json');
    constantsData = await res.json();
    constantsData.forEach(item => {
      constantsByType[item.datatype].set(item.name, item);
    });
    return constantsData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

//Function to fetch constants and populate dropdown menues
async function populateData() {
  const data = await fetchConstants();

  const dropdownPot = document.getElementById("potType");
  const dropdownPlant = document.getElementById("plantType");
  const dropdownSeason = document.getElementById("season");
  
  constantsByType.pot.forEach((val, key) => {
    dropdownPot.add(new Option(key, key));
  });
  constantsByType.species.forEach((val, key) => {
    dropdownPlant.add(new Option(key, key));
  });
  constantsByType.season.forEach((val, key) => {
    dropdownSeason.add(new Option(key, key));
  });
}

//Function to calculate water and fertilizer recommendations
async function calculateRecommendations(potVolume, potType, plantType, season) {
  const data = await fetchConstants();
  if (!data) return;

  let potdata
  let speciesdata
  let seasondata

  for (let i = 0; i < data.length; i++) {
    if(data[i].datatype === "pot" && data[i].name === potType) {
      potdata = data[i]
    } else if(data[i].datatype === "species" && data[i].name === plantType) {
      speciesdata = data[i]
    } else if(data[i].datatype === "season" && data[i].name === season) {
      seasondata = data[i]
    }
  } 
 
  let water = potVolume * 0.0001 * potdata.datafield_1 * seasondata.datafield_1
  let fertilizer = water * seasondata.datafield_2

  document.getElementById('recommendedWater').textContent = `${water.toFixed(1)} liters`;
  document.getElementById('recommendedFertilizer').textContent = `${fertilizer.toFixed(2)} units`;
}

// Function to search recommendations data and calculate statistics based on it and user inputs
async function findRecommendations(potVolume, potType, plantType, season) {
  const data = await fetchData();
  if (!data) return;

  let similarCount = 0
  let similarwaterCount = 0
  let similarwaterGrowthSum = 0
  let similarwaterYieldSum = 0
  let lesswaterCount = 0
  let lesswaterGrowthSum = 0
  let lesswaterYieldSum = 0
  let morewaterCount = 0
  let morewaterGrowthSum = 0
  let morewaterYieldSum = 0

  for (let i = 0; i < data.length; i++) {
	if(data[i].pot_type === potType && data[i].plant_type === plantType && data[i].time_of_year === season 
      && data[i].pot_volume > (potVolume * 0.9)  && data[i].pot_volume < (potVolume * 1.1)) {
        similarCount = similarCount + 1
		
		if (data[i].actual_water >=  (data[i].recommented_water * 1.1)) {
			morewaterCount = morewaterCount + 1
            morewaterGrowthSum = morewaterGrowthSum + data[i].growth_rate
            morewaterYieldSum = morewaterYieldSum + data[i].crop_yield
		} else if (data[i].actual_water <=  (data[i].recommented_water * 0.9)) {
		    lesswaterCount = lesswaterCount + 1
            lesswaterGrowthSum = lesswaterGrowthSum + data[i].growth_rate
            lesswaterYieldSum = lesswaterYieldSum + data[i].crop_yield
		} else {
		    similarwaterCount = similarwaterCount + 1
            similarwaterGrowthSum = similarwaterGrowthSum + data[i].growth_rate
            similarwaterYieldSum = similarwaterYieldSum + data[i].crop_yield
		}
    }
  }
  document.getElementById('similar').textContent = similarCount;
  document.getElementById('similarwaterCount').textContent = similarwaterCount;
  document.getElementById('similarwaterGrowthAverage').textContent = similarwaterCount ? (similarwaterGrowthSum / similarwaterCount).toFixed(1) : "-";
  document.getElementById('similarwaterYieldAverage').textContent = similarwaterCount ? (similarwaterYieldSum / similarwaterCount).toFixed(1):"-";
  document.getElementById('lesswaterCount').textContent = lesswaterCount;
  document.getElementById('lesswaterGrowthAverage').textContent = lesswaterCount ?(lesswaterGrowthSum / lesswaterCount).toFixed(1): "-";
  document.getElementById('lesswaterYieldAverage').textContent = lesswaterCount ? (lesswaterYieldSum / lesswaterCount).toFixed(1):"-";
  document.getElementById('morewaterCount').textContent = morewaterCount;
  document.getElementById('morewaterGrowthAverage').textContent = morewaterCount ? (morewaterGrowthSum / morewaterCount).toFixed(1):"-";
  document.getElementById('morewaterYieldAverage').textContent = morewaterCount ? (morewaterYieldSum / morewaterCount).toFixed(1):"-";

  document.getElementById("outputSection").style.display = "block";
}

function calculatePotVolume(diameter, height) {
  const radius = diameter / 2;
  return Math.PI * Math.pow(radius, 2) * height;
}

document.addEventListener("DOMContentLoaded", populateData);

// Event listener for the calculate button
document.getElementById('calculateButton').addEventListener('click', function() {
  const potType = document.getElementById('potType').value;
  const potDiameter = parseFloat(document.getElementById('potDiameter').value);
  const potHeight = parseFloat(document.getElementById('potHeight').value);
  const plantType = document.getElementById('plantType').value;
  const season = document.getElementById('season').value;

  // Calculate pot volume (if needed in your logic)
  const potVolume = calculatePotVolume(potDiameter, potHeight);
  document.getElementById('potSize').textContent = (potVolume/1000).toFixed(1);

  calculateRecommendations(potVolume, potType, plantType, season)

  // Find and display recommendations and statistics
  findRecommendations(potVolume, potType, plantType, season);
});
