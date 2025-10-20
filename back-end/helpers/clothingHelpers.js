const clothingTypes = [
    "shirt", "pants", "dress", "skirt", "jacket", "coat", "sweater", "t-shirt",
    "jeans", "shorts", "blouse", "suit", "hoodie", "scarf", "gloves", "hat",
    "cap", "shoes", "boots", "sneakers", "sneaker", "socks", "tie", "belt", "underwear", "tee", "boost", "Slipper", 
];


const brands = [
    "Nike", "Adidas", "Puma", "Gucci", "Prada", "Louis Vuitton", "Chanel",
    "H&M", "Zara", "Uniqlo", "Levi's", "Ralph Lauren", "Calvin Klein", "Tommy Hilfiger", "Essentials", "Gallery Dept",
    "New Balance", "Yeezy", "adidas", "Chrome hearts", "GAP", "Columbia", "Hermes", "Skechers", "Vans", "Timberland", "UGG", "Converse",
    "Rick Owens", "Acne Studios"
    // add more later
];

const colors = [
    "red", "blue", "green", "yellow", "black", "white", "pink", "purple", "orange",
    "gray", "brown", "beige", "gold", "silver", "navy", "maroon", "teal", "turquoise", "burgundy", "Oatmeal",
    "light blue", "dark blue", "light green", "dark green", "light red", "dark red", "light yellow", "dark yellow",
    // add more later
];

export function extractClothingType(titles) {
    const foundTypes = {};
    titles.forEach(title => {
        clothingTypes.forEach(type => {
            if (title.toLowerCase().includes(type.toLowerCase())) {
                foundTypes[type] = (foundTypes[type] || 0) + 1;
            }
        });
    });
    const sorted = Object.entries(foundTypes).sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : 'Unknown';
}

//extract the most frequent brand from search titles
export function extractBrand(titles) {
    const foundBrands = {};
    titles.forEach(title => {
        brands.forEach(brand => {
            if (title.toLowerCase().includes(brand.toLowerCase())) {
                foundBrands[brand] = (foundBrands[brand] || 0) + 1;
            }
        });
    });
    const sorted = Object.entries(foundBrands).sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : 'Unknown';
}

//extract the most frequent color from search titles
export function extractColor(titles) {
    const foundColors = {};
    titles.forEach(title => {
        colors.forEach(color => {
            if (title.toLowerCase().includes(color.toLowerCase())) {
                foundColors[color] = (foundColors[color] || 0) + 1;
            }
        });
    });
    const sorted = Object.entries(foundColors).sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : 'Unknown';
}

//categorize a clothing type into tops, bottoms, shoes, or other
export function categorizeClothing(type) {
    const t = type.toLowerCase();
    const tops = ['shirt','t-shirt','suit','hoodie','blouse','sweater','jacket','coat','dress','tee'];
    const bottoms = ['pants','jeans','shorts','skirt','trousers','leggings','sweatpants','joggers'];
    const shoes = ['shoes','boots','sneakers','sandals','sneaker','boost', 'slipper'];
    if (tops.includes(t)) return 'tops';
    if (bottoms.includes(t)) return 'bottoms';
    if (shoes.includes(t)) return 'shoes';
    return 'other';
}