// Life Cycle Assessment (LCA) Carbon Footprint Calculation Engine
export const calculateLcaFootprint = (inputs) => {
    const electricityKwh = inputs?.energy?.electricity || 0;

    // Emission factors (kg CO2 per unit)
    const gridFactor = 0.82; // Standard grid intensity factor
    const factors = {
        petrolCar: 0.18,
        dieselCar: 0.14,
        twowheeler: 0.06,
        publicMetro: 0.03
    };

    const energyImpact = electricityKwh * gridFactor;

    const transportImpact =
        ((inputs?.transport?.petrolCarKm || 0) * factors.petrolCar) +
        ((inputs?.transport?.dieselCarKm || 0) * factors.dieselCar) +
        ((inputs?.transport?.twowheelerKm || 0) * factors.twowheeler) +
        ((inputs?.transport?.publicTransitKm || 0) * factors.publicMetro);

    return {
        energy: energyImpact,
        transport: transportImpact,
        total: parseFloat((energyImpact + transportImpact).toFixed(2))
    };
};