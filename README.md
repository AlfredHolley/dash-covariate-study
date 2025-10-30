# Fasting Effects Simulation Application

An elegant and minimalist web application developed with Dash, inspired by Buchinger Wilhelmi's fasting medicine philosophy.

## 🎨 Design

The interface features a clean and soothing design with:
- White base with soft gray accents
- Light shadows and rounded borders
- Modern typography (Lato, Open Sans)
- Smooth transitions and responsive layout
- Generous spacing for a calm user experience

## 🚀 Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation Steps

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Add decorative images (optional)**
   
   Place your images in the `assets/img/` folder:
   - `logo_bw.svg` : Logo displayed at the top (already included)
   - `background.jpg` : Subtle background image (optional)
   
   The application will work perfectly even without additional images.

3. **Launch the application**
   ```bash
   python app.py
   ```

4. **Open in browser**
   
   Navigate to: `http://localhost:8050`

## 📊 Usage

### 1. Body Composition
Enter your physical data:
- **Weight** (kg): Your current weight
- **Height** (cm): Your height
- **Gender**: Male or Female

### 2. Metabolic Parameters
Enter your biomarkers (all optional):
- **LDL** (mmol/L): LDL cholesterol ("bad cholesterol")
- **Fasting Glucose** (mmol/L): Fasting blood glucose
- **Total Cholesterol** (mmol/L): Total cholesterol
- **GGT** (U/L): Gamma-glutamyl transferase (liver function)
- **GPT/ALT** (U/L): Alanine aminotransferase (liver function)
- **Alkaline Phosphatase** (U/L): Liver enzyme

### 3. Simulation
Click **"Run Simulation"** to visualize the predicted evolution of your biomarkers during a 0 to 14-day fast.

### 4. Separated Charts
Results are now displayed in separate charts by category:
- **Lipid Profile**: LDL and Total Cholesterol (mmol/L scale)
- **Glucose Metabolism**: Fasting glucose (mmol/L scale)
- **Liver Function**: GGT, GPT/ALT, Alkaline Phosphatase (U/L scale)

## 🔬 Simulation Algorithm

The algorithm calculates predicted fasting effects based on:

1. **Adaptation to available data**: The algorithm works with any combination of parameters
2. **Personalized factors**:
   - BMI (Body Mass Index): Overweight individuals may experience more pronounced improvements
   - Gender: Adjustment of reduction rates according to gender
3. **Physiological models**:
   - Exponential decay to simulate realistic metabolic changes
   - Physiological minimums respected (e.g., glucose doesn't drop below 4.0 mmol/L)
   - Differentiated change rates according to biomarkers

### Typical simulated effects:
- **LDL**: 10-20% reduction according to BMI
- **Glucose**: Rapid decrease then stabilization (15-25% according to initial level)
- **Total Cholesterol**: Moderate reduction (~12%)
- **Liver enzymes (GGT, GPT, AP)**: Progressive improvement (10-30% according to initial level)

### Chart Separation Benefits:
- **Different scales**: Each category uses appropriate units and scales
- **Better readability**: Lipids (mmol/L) vs Liver enzymes (U/L) are clearly separated
- **Focused analysis**: Users can analyze each metabolic category independently

## 📁 Structure du Projet

```
dash-app/
│
├── app.py                  # Application Dash principale
├── requirements.txt        # Dépendances Python
├── README.md              # Documentation (ce fichier)
├── dash_dataset.csv       # Données (si nécessaire)
│
└── assets/
    ├── styles.css         # Styles CSS minimalistes
    └── img/              # Images décoratives (optionnel)
        ├── logo.png      # Logo de l'application
        └── background.jpg # Image de fond
```

## 🎯 Caractéristiques Techniques

- **Framework** : Dash 2.14.2
- **Visualisation** : Plotly 5.18.0
- **Calculs scientifiques** : NumPy, Pandas
- **Responsive Design** : Compatible mobile et tablette
- **Animations** : Transitions CSS fluides
- **Serveur** : Prêt pour déploiement avec Gunicorn

## 🌐 Déploiement

Pour déployer en production :

```bash
gunicorn app:server -b 0.0.0.0:8050
```

## 💡 Inspiration

Cette application s'inspire de la philosophie de la médecine du jeûne de **Buchinger Wilhelmi**, une approche scientifique et holistique du jeûne thérapeutique.

## ⚠️ Avertissement

Cette application est un outil de visualisation éducatif. Les simulations sont basées sur des modèles généraux et ne constituent pas un avis médical. Consultez toujours un professionnel de santé avant d'entreprendre un jeûne.

## 📝 Notes

- L'algorithme s'adapte automatiquement aux données disponibles
- Vous pouvez laisser des champs vides - seuls les paramètres renseignés seront visualisés
- Les résultats sont basés sur des études générales et peuvent varier selon les individus
- L'interface est entièrement en français pour une meilleure accessibilité

## 🔧 Personnalisation

### Modifier les couleurs
Éditez le fichier `assets/styles.css` pour personnaliser :
- Les couleurs de base
- Les dégradés
- Les ombres
- Les transitions

### Ajuster l'algorithme
Dans `app.py`, la fonction `calculate_fasting_effects()` peut être modifiée pour :
- Ajuster les taux de réduction
- Ajouter de nouveaux biomarqueurs
- Modifier les durées de jeûne simulées

---

**Développé avec ❤️ pour la santé et le bien-être**

