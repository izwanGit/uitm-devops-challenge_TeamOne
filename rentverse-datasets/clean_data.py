import pandas as pd
import json
import re
import os
import glob

def clean_rental_data():
    # 1. Define the list of files to process
    files = [
        "rentals_johor.csv",
        "rentals_kedah.csv",
        "rentals_kelantan.csv",
        "rentals_kuala-lumpur.csv",
        "rentals_labuan.csv",
        "rentals_melaka.csv",
        "rentals_negeri-sembilan.csv",
        "rentals_pahang.csv",
        "rentals_penang.csv",
        "rentals_perak.csv",
        "rentals_putrajaya.csv",
        "rentals_sabah.csv",
        "rentals_sarawak.csv",
        "rentals_selangor.csv",
        "rentals_terengganu.csv"
    ]

    # --- Cleaning Functions ---

    def clean_images(val):
        """
        Splits a comma-separated string of URLs into a clean JSON list.
        Removes whitespace and empty entries.
        Example: "url1, url2 " -> ["url1", "url2"]
        """
        if pd.isna(val) or val == "":
            return []
        
        # Ensure input is a string
        val_str = str(val)
        
        if val_str.strip() == "":
            return []
            
        # Split by comma
        urls = val_str.split(',')
        
        # Trim whitespace from each URL and filter out empty strings
        cleaned_urls = [url.strip() for url in urls if url.strip()]
        
        return cleaned_urls

    def clean_price(val):
        """
        Extracts numeric value from price string.
        Removes 'RM', commas, and currency symbols.
        Example: "RM 1,200" -> 1200
        """
        if pd.isna(val):
            return None
        
        val_str = str(val)
        # Remove everything except digits and dots (for cents)
        # This regex removes currency symbols, letters, and commas
        clean_str = re.sub(r'[^\d.]', '', val_str)
        
        try:
            # Convert to float first to handle decimals
            num = float(clean_str)
            # If it's a whole number, return as int (cleaner for JSON)
            if num.is_integer():
                return int(num)
            return num
        except ValueError:
            return None

    def clean_area(val):
        """
        Extracts numeric value from area string.
        Removes 'sqft', 'sqm', commas, etc.
        Example: "1,500 sqft" -> 1500
        """
        if pd.isna(val):
            return None
            
        val_str = str(val)
        # Remove everything except digits and dots
        clean_str = re.sub(r'[^\d.]', '', val_str)
        
        try:
            num = float(clean_str)
            if num.is_integer():
                return int(num)
            return num
        except ValueError:
            return None

    # --- Main Processing Loop ---
    
    dataframes = []
    print("Starting data processing...")

    for file in files:
        if os.path.exists(file):
            try:
                # Read CSV
                df = pd.read_csv(file)
                
                # Optional: Add a column to track which state/file this came from
                state_name = file.replace("rentals_", "").replace(".csv", "").replace("-", " ").title()
                df['source_state'] = state_name
                
                dataframes.append(df)
                print(f"✔ Loaded {file}: {len(df)} rows")
            except Exception as e:
                print(f"❌ Error loading {file}: {e}")
        else:
            print(f"⚠️ File not found: {file}")

    if not dataframes:
        print("No data found to process.")
        return

    # Combine all individual dataframes into one
    full_df = pd.concat(dataframes, ignore_index=True)
    print(f"\nTotal raw records: {len(full_df)}")

    # --- Apply Cleaning Rules ---

    # 1. Clean IMAGES (String -> List of Strings)
    print("Cleaning image URLs...")
    full_df['images'] = full_df['images'].apply(clean_images)

    # 2. Clean PRICE (String -> Number)
    print("Cleaning prices...")
    full_df['price'] = full_df['price'].apply(clean_price)

    # 3. Clean AREA (String -> Number)
    print("Cleaning area data...")
    full_df['area'] = full_df['area'].apply(clean_area)

    # 4. Clean BEDROOMS & BATHROOMS (Fill NA -> Integer)
    print("Standardizing bedroom/bathroom counts...")
    # Fill missing values with 0 and convert to integer
    full_df['bathrooms'] = full_df['bathrooms'].fillna(0).astype(int)
    full_df['bedrooms'] = full_df['bedrooms'].fillna(0).astype(int)

    # 5. Final Data Type Check & Verification
    # Ensure listing_id is a string (sometimes IDs are read as numbers)
    if 'listing_id' in full_df.columns:
        full_df['listing_id'] = full_df['listing_id'].astype(str).str.strip()

    # Drop rows that might be completely empty artifacts
    full_df.dropna(how='all', inplace=True)

    # --- Final Polish ---
    # Replace NaN with None (which becomes 'null' in JSON) to avoid syntax errors
    full_df = full_df.replace({float('nan'): None})
    
    # --- Export to JSON ---
    
    output_filename = 'cleaned_dataset.json'
    
    # Convert DataFrame to a list of dictionaries (records)
    json_data = full_df.to_dict(orient='records')
    
    print(f"\nExporting to {output_filename}...")
    
    with open(output_filename, 'w', encoding='utf-8') as f:
        # ensure_ascii=False ensures characters like 'RM' or local text stay readable
        # allow_nan=False would throw error, but we already replaced them.
        json.dump(json_data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ SUCCESS! Processed {len(json_data)} listings.")
    print(f"Data saved to: {os.path.abspath(output_filename)}")

if __name__ == "__main__":
    clean_rental_data()