import os
import json

def organize_and_build_json(category_name, display_title, default_price):
    image_dir = f"images/{category_name}"
    data_dir = "data"
    output_json_path = f"{data_dir}/{category_name}.json"
    
    # 1. Auto-create data and image folders if they are missing
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    if not os.path.exists(image_dir):
        os.makedirs(image_dir)
        print(f"📁 Created empty folder '{image_dir}'.")
        
    # 2. Scan for image files
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    if not os.path.exists(image_dir):
        return
        
    files = sorted([f for f in os.listdir(image_dir) if f.lower().endswith(valid_extensions)])
    
    if not files:
        print(f"ℹ️ Place your raw images inside '{image_dir}' so I can format them!")
        return
        
    print(f"Processing {len(files)} files in {category_name}...")
    products = []
    
    # 3. Rename files and build JSON data structures
    for index, old_name in enumerate(files, start=1):
        ext = os.path.splitext(old_name)[1].lower()
        new_name = f"{category_name}-{index:03d}{ext}"
        
        old_path = os.path.join(image_dir, old_name)
        new_path = os.path.join(image_dir, new_name)
        
        try:
            if old_name != new_name:
                os.rename(old_path, new_path)
        except Exception as e:
            print(f"Skipping rename for {old_name}: {e}")
            continue
            
        product_id = f"{category_name[:3]}-{index:03d}"
        products.append({
            "id": product_id,
            "name": f"Baari {display_title} #{index:03d}",
            "price": default_price,
            "img": f"{image_dir}/{new_name}"
        })
    
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2)
        
    print(f"✅ Success: Generated {output_json_path}!")

if __name__ == "__main__":
    organize_and_build_json("boots", "Football Boot", "Ksh 12,500")
    organize_and_build_json("jerseys", "Club Jersey", "Ksh 2,500")
