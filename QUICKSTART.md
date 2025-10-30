# 🚀 Quick Start Guide

## Installation in 3 steps

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Launch the application
```bash
python app.py
```

### 3. Open in browser
Navigate to: **http://localhost:8050**

---

## 📝 Usage Examples

### Scenario 1: Person with high cholesterol
1. Enter:
   - Weight: 80 kg
   - Height: 175 cm
   - Gender: Male
   - LDL: 4.5 mmol/L
   - Total Cholesterol: 6.5 mmol/L
   - Glucose: 6.0 mmol/L

2. Click "Run Simulation"

3. Observe how these biomarkers evolve during 14 days of fasting
   - **Lipid Profile chart** will show LDL and Total Cholesterol trends
   - **Glucose Metabolism chart** will show glucose evolution

### Scenario 2: Person with liver issues
1. Enter:
   - Weight: 90 kg
   - Height: 170 cm
   - Gender: Female
   - GGT: 65 U/L
   - GPT: 45 U/L
   - AP: 120 U/L

2. Click "Run Simulation"

3. Visualize the progressive improvement of liver enzymes
   - **Liver Function chart** will display all three enzymes with appropriate U/L scale

---

## 💡 Tips

- **You can leave fields empty**: The application adapts to available data
- **All parameters are optional**: Only enter what you know
- **Interactive charts**: Hover over curves to see detailed values
- **Responsive**: The application adapts to all screens (mobile, tablet, desktop)
- **Separated charts**: Each biomarker category has its own chart with appropriate scales
- **Smart display**: Only relevant chart categories are shown based on your input

---

## 🎨 Customization

### Modify colors
Edit `assets/styles.css` and change color values.

### Add/modify images
Place your images in `assets/img/`:
- Logo is already configured: `logo_bw.svg`
- You can add background images

### Adjust calculations
In `app.py`, modify the `calculate_fasting_effects()` function to adjust:
- Reduction rates
- Fasting durations
- Correction factors

### Chart categories
Modify chart categories by changing the 'category' field in the results dictionary:
- 'lipid' for lipid profile markers
- 'glucose' for glucose metabolism
- 'liver' for liver function enzymes

---

## ⚠️ Troubleshooting

### Application won't start
- Check that Python 3.8+ is installed: `python --version`
- Reinstall dependencies: `pip install -r requirements.txt --upgrade`

### Port already in use
If port 8050 is occupied, modify in `app.py`:
```python
app.run(debug=True, port=8051)  # Change 8051 as needed
```

### Charts don't display
- Make sure you've entered at least one metabolic parameter
- Click the "Run Simulation" button
- Check console for any errors
- Only relevant chart categories will be shown (e.g., no liver chart if no liver enzymes entered)

---

## 📊 Biomarkers Explained

| Biomarker | Description | Normal Values | Chart Category |
|-----------|-------------|---------------|----------------|
| **LDL** | "Bad" cholesterol | < 3.0 mmol/L | Lipid Profile |
| **Glucose** | Fasting blood sugar | 4.0-6.0 mmol/L | Glucose Metabolism |
| **Total Cholesterol** | Overall cholesterol | < 5.0 mmol/L | Lipid Profile |
| **GGT** | Liver enzyme | 10-50 U/L | Liver Function |
| **GPT/ALT** | Liver enzyme | 10-40 U/L | Liver Function |
| **Alkaline Phosphatase** | Liver/bone enzyme | 40-130 U/L | Liver Function |

---

## 🌟 Next Steps

1. ✅ Test the application with different profiles
2. ✅ Customize colors according to your preferences
3. ✅ Add your own images
4. ✅ Share with your team or patients
5. ✅ Explore the separated chart categories for better analysis

---

**Need help?** Check the `README.md` file for more details.

