
// Lookup table for Malaysian city coordinates
// Used as fallback when property coordinates are missing

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    // Johor
    'Bandar Johor Bahru': { lat: 1.4927, lng: 103.7414 },
    'Johor Bahru': { lat: 1.4927, lng: 103.7414 },
    'Plentong': { lat: 1.5298, lng: 103.8236 },
    'Tebrau': { lat: 1.5540, lng: 103.7746 },
    'Pulai': { lat: 1.5794, lng: 103.5513 },
    'Iskandar Puteri': { lat: 1.4172, lng: 103.6276 },
    'Pasir Gudang': { lat: 1.4294, lng: 103.9056 },

    // Kuala Lumpur & Selangor
    'Bandar Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
    'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
    'Bandar Petaling Jaya': { lat: 3.1096, lng: 101.6424 },
    'Petaling Jaya': { lat: 3.1096, lng: 101.6424 },
    'Damansara': { lat: 3.1378, lng: 101.6111 },
    'Cheras': { lat: 3.0618, lng: 101.7454 },
    'Mont Kiara': { lat: 3.1691, lng: 101.6521 },
    'Bangsar': { lat: 3.1292, lng: 101.6667 },
    'Ampang': { lat: 3.1598, lng: 101.7634 },
    'Subang Jaya': { lat: 3.0450, lng: 101.5900 },
    'Shah Alam': { lat: 3.0738, lng: 101.5183 },
    'Klang': { lat: 3.0442, lng: 101.4447 },
    'Kapar': { lat: 3.1388, lng: 101.3725 },
    'Dengkil': { lat: 2.8947, lng: 101.6784 },
    'Sepang': { lat: 2.7562, lng: 101.6966 },
    'Cyberjaya': { lat: 2.9213, lng: 101.6559 },
    'Putrajaya': { lat: 2.9264, lng: 101.6964 },
    'Kajang': { lat: 2.9935, lng: 101.7874 },
    'Setapak': { lat: 3.2046, lng: 101.7225 },
    'Batu': { lat: 3.2167, lng: 101.6875 },

    // Penang
    'Georgetown': { lat: 5.4141, lng: 100.3288 },
    'Bandaraya Georgetown': { lat: 5.4141, lng: 100.3288 },
    'Bayan Lepas': { lat: 5.2928, lng: 100.2736 },
    'Tanjung Tokong': { lat: 5.4523, lng: 100.3060 },
    'Gelugor': { lat: 5.3813, lng: 100.3090 },

    // Perak
    'Ipoh': { lat: 4.5975, lng: 101.0901 },
    'Ulu Kinta': { lat: 4.6333, lng: 101.1167 },
    'Taiping': { lat: 4.8500, lng: 100.7333 },
    'Manjung': { lat: 4.2000, lng: 100.6667 },

    // Kedah / Langkawi
    'Kuah': { lat: 6.3265, lng: 99.8432 },
    'Padang Masirat': { lat: 6.3456, lng: 99.7297 },
    'Sungai Petani': { lat: 5.6405, lng: 100.4825 },
    'Kulim': { lat: 5.3708, lng: 100.5544 },
    'Alor Setar': { lat: 6.1184, lng: 100.3685 },
    'Kota Setar': { lat: 6.1184, lng: 100.3685 }, // Same as Alor Setar

    // Terengganu
    'Kuala Terengganu': { lat: 5.3117, lng: 103.1324 },
    'Cabang Tiga': { lat: 5.3167, lng: 103.1167 }, // Near KT
    'Marang': { lat: 5.2000, lng: 103.2000 },
    'Kemaman': { lat: 4.2333, lng: 103.4167 },
    'Dungun': { lat: 4.7333, lng: 103.4167 },

    // Kelantan
    'Kota Bharu': { lat: 6.1254, lng: 102.2386 },
    'Bachok': { lat: 6.0667, lng: 102.4000 },
    'Pasir Mas': { lat: 6.0493, lng: 102.1399 },

    // Pahang
    'Kuantan': { lat: 3.8077, lng: 103.3260 },
    'Bentong': { lat: 3.5167, lng: 101.9167 },
    'Temerloh': { lat: 3.4500, lng: 102.4167 },
    'Pekan': { lat: 3.4833, lng: 103.3833 },

    // Negeri Sembilan
    'Seremban': { lat: 2.7258, lng: 101.9424 },
    'Bandar Seremban': { lat: 2.7258, lng: 101.9424 },
    'Nilai': { lat: 2.8167, lng: 101.8000 },
    'Port Dickson': { lat: 2.5333, lng: 101.7833 },

    // Melaka
    'Melaka': { lat: 2.1896, lng: 102.2501 },
    'Bandar Melaka': { lat: 2.1896, lng: 102.2501 },
    'Bukit Baru': { lat: 2.2167, lng: 102.2833 },
    'Ayer Keroh': { lat: 2.2667, lng: 102.2833 },
    'Bukit Katil': { lat: 2.2333, lng: 102.3000 },

    // Sabah
    'Kota Kinabalu': { lat: 5.9804, lng: 116.0753 },
    'Sandakan': { lat: 5.8402, lng: 118.1179 },
    'Tawau': { lat: 4.2498, lng: 117.8871 },
    'Penampang': { lat: 5.9167, lng: 116.1167 },

    // Sarawak
    'Kuching': { lat: 1.5533, lng: 110.3592 },
    'Miri': { lat: 4.4148, lng: 114.0089 },
    'Sibu': { lat: 2.3001, lng: 111.8088 },
    'Bintulu': { lat: 3.1760, lng: 113.0411 },
    'Limbang': { lat: 4.7500, lng: 115.0000 },

    // Perlis
    'Kangar': { lat: 6.4333, lng: 100.1833 },
    'Arau': { lat: 6.4297, lng: 100.2697 },

    // Putrajaya / Cyberjaya details (Putrajaya already defined above at line 32)
    'Presint 1': { lat: 2.9430, lng: 101.7000 },
    'Presint 2': { lat: 2.9264, lng: 101.6964 },


    // State Level Fallbacks (Mapping State Name to Capital/Center)
    'Johor': { lat: 1.4927, lng: 103.7414 }, // JB
    'Kedah': { lat: 6.1184, lng: 100.3685 }, // Alor Setar
    'Kelantan': { lat: 6.1254, lng: 102.2386 }, // Kota Bharu
    // 'Melaka' already defined in city section above
    'Negeri Sembilan': { lat: 2.7258, lng: 101.9424 }, // Seremban
    'Pahang': { lat: 3.8077, lng: 103.3260 }, // Kuantan
    'Penang': { lat: 5.4141, lng: 100.3288 }, // Georgetown
    'Pulau Pinang': { lat: 5.4141, lng: 100.3288 }, // Georgetown
    'Perak': { lat: 4.5975, lng: 101.0901 }, // Ipoh
    'Perlis': { lat: 6.4333, lng: 100.1833 }, // Kangar
    'Sabah': { lat: 5.9804, lng: 116.0753 }, // KK
    'Sarawak': { lat: 1.5533, lng: 110.3592 }, // Kuching
    'Selangor': { lat: 3.0738, lng: 101.5183 }, // Shah Alam
    'Terengganu': { lat: 5.3117, lng: 103.1324 }, // Kuala Terengganu
    'Wilayah Persekutuan Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
    'W.P. Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
    'Wilayah Persekutuan Putrajaya': { lat: 2.9264, lng: 101.6964 },
    'W.P. Putrajaya': { lat: 2.9264, lng: 101.6964 },
    'Labuan': { lat: 5.2831, lng: 115.2308 },
    'Wilayah Persekutuan Labuan': { lat: 5.2831, lng: 115.2308 },

    // Default fallback (KL City Center)
    'DEFAULT': { lat: 3.1390, lng: 101.6869 }
};

export function getCoordinatesForCity(city: string): { lat: number; lng: number } {
    if (!city) return CITY_COORDINATES['DEFAULT'];

    // Normalize input to lowercase for case-insensitive matching
    const normalizedCity = city.toLowerCase().trim();

    // Try exact match (case-insensitive)
    const exactKey = Object.keys(CITY_COORDINATES).find(
        k => k.toLowerCase() === normalizedCity
    );
    if (exactKey) {
        return CITY_COORDINATES[exactKey];
    }

    // Try partial match (e.g. "kuala lumpur" matches "Bandar Kuala Lumpur")
    const partialKey = Object.keys(CITY_COORDINATES).find(
        k => k.toLowerCase().includes(normalizedCity) || normalizedCity.includes(k.toLowerCase())
    );
    if (partialKey) {
        return CITY_COORDINATES[partialKey];
    }

    return CITY_COORDINATES['DEFAULT'];
}
