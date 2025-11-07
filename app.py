"""
Application Dash simplifiée utilisant les données réelles du fichier CSV
Affiche les données pré/post des patients similaires selon les critères d'entrée
"""

import warnings
# Supprimer le warning de parsing de dates de Dash/Flask
warnings.filterwarnings("ignore", message=".*Parsing dates involving a day of month without a year specified.*")

import dash
from dash import dcc, html, Input, Output, dash_table, State
from dash.dependencies import ClientsideFunction
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
from datetime import datetime

# Chargement des données
# df_long = pd.read_csv("df_long.csv", index_col=0, parse_dates=False)
df_wide = pd.read_csv("dash_dataset_wide.csv", index_col=0, parse_dates=False)

# Plus de statistiques p-valeurs utilisées (df_stats supprimé)

# Charger les seuils de référence depuis l'Excel
try:
    df_thresholds = pd.read_excel("biomarker_reference_ranges_english.xlsx")
    BIOMARKER_THRESHOLDS = {}
    for _, row in df_thresholds.iterrows():
        biomarker = row['Biomarker']
        low = row['Low threshold']
        high = row['High threshold']
        BIOMARKER_THRESHOLDS[biomarker] = {
            'low': low if pd.notna(low) else None,
            'high': high if pd.notna(high) else None
        }
except Exception as e:
    print(f"Warning: Could not load biomarker thresholds: {e}")
    BIOMARKER_THRESHOLDS = {}

BIOMARKER_CATEGORIES = {
    'Hepatic health': ['ALP [U/L]', 'GGT [U/L]', 'GOT AST [U/L]', 'GPT ALT [U/L]', 'FLI'],
    'Cardiometabolic profile': ['TC [mg/dL]', 'LDL [mg/dL]', 'HDL [mg/dL]', 'TG [mg/dL]', 'SBP [mmHg]', 'DBP [mmHg]', 'glucose [mg/dL]', 'HBA1C [mmol/mol]', 'TSH [µU/mL]'],
    'Body composition': ['BMI [kg/m²]', 'weight [kg]', 'WC [cm]'],
    'Renal function & Electrolytes': ['creatinine [mg/dL]', 'GFR [mL/min/1.73m²]', 'urea [mg/dL]', 'uric acid [mg/dL]', 'K [mmol/L]', 'Na [mmol/L]', 'Mg [mg/dL]', 'Ca [mg/dL]'],
    'Blood & Immunity': ['quick [%]','erythrocytes [T/L]', 'hemoglobin [g/dL]', 'hematocrit [%]', 'thrombocytes [G/L]', 'MCV [fL]', 'MCH [pg]', 'MCHC [g/dL]'],
    'Inflammation': ['CRP hs [mg/L]', 'ESR 1H [mm/h]', 'ESR 2H [mm/h]', 'leukocytes [G/L]'],
}

# Tous les biomarqueurs disponibles
ALL_BIOMARKERS = [param for params in BIOMARKER_CATEGORIES.values() for param in params]

# Pré-calculer min/max baseline pour tous les paramètres au démarrage
print("Pré-calcul des ranges baseline pour tous les paramètres...")
BASELINE_RANGES = {}
for param in ALL_BIOMARKERS:
    if param in df_wide.columns and 'timepoint' in df_wide.columns:
        pre_values = df_wide[(df_wide['timepoint'] == 'Pre') & (df_wide[param].notna())][param]
        if not pre_values.empty:
            min_val = float(pre_values.min())
            max_val = float(pre_values.max())
            # Arrondir pour un meilleur affichage
            range_val = max_val - min_val
            if range_val > 0:
                step = max(1, range_val / 100)
                min_rounded = float(np.floor(min_val / step) * step)
                max_rounded = float(np.ceil(max_val / step) * step)
            else:
                min_rounded = min_val
                max_rounded = max_val + 1
            
            BASELINE_RANGES[param] = {
                'min': min_rounded,
                'max': max_rounded,
                'observed_min': min_val,
                'observed_max': max_val
            }
print(f"Pré-calcul terminé pour {len(BASELINE_RANGES)} paramètres.")

def format_parameter_display_name(parameter):
    """
    Formate le nom du paramètre pour l'affichage :
    - Remplace les crochets [] par des parenthèses ()
    - Applique des remplacements spécifiques avec noms complets
    """
    # Remplacements spécifiques avec noms complets
    replacements = {
          'TC [mg/dL]': 'Total Cholesterol (mg/dL)',
          'LDL [mg/dL]': 'Low-Density Lipoprotein (mg/dL)',
          'HDL [mg/dL]': 'High-Density Lipoprotein (mg/dL)',
          'TG [mg/dL]': 'Triglycerides (mg/dL)',
          'SBP [mmHg]': 'Systolic Blood Pressure (mmHg)',
          'DBP [mmHg]': 'Diastolic Blood Pressure (mmHg)',
          'GOT AST [U/L]': 'Aspartate Aminotransferase (U/L)',
          'GPT ALT [U/L]': 'Alanine Aminotransferase (U/L)',
          'ALP [U/L]': 'Alkaline Phosphatase (U/L)',
          'GGT [U/L]': 'GGT (U/L)',
          'glucose [mg/dL]': 'Glucose (mg/dL)',
          'HBA1C [mmol/mol]': 'Hemoglobin A1c (mmol/mol)',
          'TSH [µU/mL]': 'TSH (µU/mL)',
          'BMI [kg/m²]': 'Body Mass Index (kg/m²)',
          'weight [kg]': 'Weight (kg)',
          'WC [cm]': 'Waist Circumference (cm)',
          'creatinine [mg/dL]': 'Creatinine (mg/dL)',
          'GFR [mL/min/1.73m²]': 'Glomerular Filtr. Rate (mL/min/1.73m²)',
          'urea [mg/dL]': 'Urea (mg/dL)',
          'uric acid [mg/dL]': 'Uric Acid (mg/dL)',
          'K [mmol/L]': 'Potassium (mmol/L)',
          'Na [mmol/L]': 'Sodium (mmol/L)',
          'Mg [mg/dL]': 'Magnesium (mg/dL)',
          'Ca [mg/dL]': 'Calcium (mg/dL)',
          'quick [%]': 'Quick Test (%)',
          'erythrocytes [T/L]': 'Erythrocytes (T/L)',
          'hemoglobin [g/dL]': 'Hemoglobin (g/dL)',
          'hematocrit [%]': 'Hematocrit (%)',
          'thrombocytes [G/L]': 'Thrombocytes (G/L)',
          'MCV [fL]': 'Mean Corp. Volume (fL)',
          'MCH [pg]': 'Mean Corp. Hemoglobin (pg)',
          'MCHC [g/dL]': 'Mean Corp. Hemoglobin Conc (g/dL)',
          'CRP hs [mg/L]': 'C-Reactive Protein High-Sens. (mg/L)',
          'ESR 1H [mm/h]': 'Erythrocyte Sedim. Rate 1H (mm/h)',
          'ESR 2H [mm/h]': 'Erythrocyte Sedim. Rate 2H (mm/h)',
          'leukocytes [G/L]': 'Leukocytes (G/L)',
          'FLI': 'Fatty Liver Index'
    }
    
    # Si un remplacement spécifique existe, l'utiliser
    if parameter in replacements:
        return replacements[parameter]
    
    # Sinon, remplacer simplement les crochets par des parenthèses
    return parameter.replace('[', '(').replace(']', ')')


def filter_similar_patients(df, age_cat=None, bmi_cat=None, sex=None):
    """
    Filtre les patients similaires selon les critères démographiques
    """
    filtered_df = df.copy()
    
    # Filtrer par catégorie d'âge si spécifiée
    if age_cat is not None:
        filtered_df = filtered_df[filtered_df['age_cat'] == age_cat]
    
    # Filtrer par catégorie de BMI si spécifiée
    if bmi_cat is not None:
        filtered_df = filtered_df[filtered_df['BMI_cat'] == bmi_cat]
    
    # Filtrer par sexe si spécifié
    if sex is not None:
        filtered_df = filtered_df[filtered_df['sex'] == sex]
    
    return filtered_df

def filter_outliers_zscore(data, columns, threshold=4):
    """
    Filtre les valeurs aberrantes basées sur le z-score
    """
    filtered_data = data.copy()
    
    for col in columns:
        if col in filtered_data.columns:
            # Calculer le z-score
            mean_val = filtered_data[col].mean()
            std_val = filtered_data[col].std()
            
            if std_val > 0:  # Éviter la division par zéro
                z_scores = np.abs((filtered_data[col] - mean_val) / std_val)
                # Garder seulement les valeurs avec z-score <= threshold
                filtered_data = filtered_data[z_scores <= threshold]
    
    return filtered_data

def get_baseline_range_fast(df, parameter):
    """
    Version optimisée pour calculer uniquement le min/max baseline.
    Évite les calculs coûteux (pivot, merge, filtrage outliers).
    """
    if parameter not in df.columns or 'timepoint' not in df.columns:
        return None, None
    
    # Filtrer uniquement les valeurs Pre pour ce paramètre
    pre_values = df[(df['timepoint'] == 'Pre') & (df[parameter].notna())][parameter]
    
    if pre_values.empty:
        return None, None
    
    return float(pre_values.min()), float(pre_values.max())

def get_pre_post_data(df, parameter):
    """
    Récupère les données pré/post pour un paramètre donné à partir d'un DF "wide"
    qui contient une colonne par paramètre ET une colonne 'timepoint' (Pre/Post).
    """
    required_cols = [col for col in ['meta_id', 'timepoint', 'length_of_fasting_cat', 'sex', 'age', 'BMI', 'length_of_fasting'] if col in df.columns]
    if parameter not in df.columns or 'timepoint' not in df.columns:
        return pd.DataFrame()

    # Subset avec la colonne du paramètre
    subset = df[required_cols + [parameter]].copy()
    # Garder uniquement Pre/Post
    subset = subset[subset['timepoint'].isin(['Pre', 'Post'])]
    if subset.empty:
        return pd.DataFrame()

    try:
        pivot_data = subset.pivot_table(
            index=['meta_id'],
            columns='timepoint',
            values=parameter,
            aggfunc='first'
        ).reset_index()
        # Ré-ajouter les méta-infos (une par meta_id)
        meta_cols = [c for c in ['meta_id', 'length_of_fasting_cat', 'sex', 'age', 'BMI', 'length_of_fasting'] if c in subset.columns]
        meta_unique = subset[meta_cols].drop_duplicates('meta_id')
        pivot_data = pivot_data.merge(meta_unique, on='meta_id', how='left')
    except Exception:
        return pd.DataFrame()

    # Supprimer lignes incomplètes
    pivot_data = pivot_data.dropna(subset=['Pre', 'Post'])
    
    # Vérifier s'il reste des données après le nettoyage
    if pivot_data.empty:
        return pd.DataFrame()
    
    
    pivot_data['Delta'] = pivot_data['Post'] - pivot_data['Pre']
    pivot_data['Delta_pct'] = (pivot_data['Delta'] / pivot_data['Pre']) * 100
    
    # Filtrer les valeurs aberrantes (z-score > 4) pour Pre, Post, Delta et Delta_pct
    n_before = len(pivot_data)
    pivot_data = filter_outliers_zscore(pivot_data, ['Pre', 'Post', 'Delta', 'Delta_pct'], threshold=4)
    n_after = len(pivot_data)
    
    # Stocker l'information sur le filtrage des outliers pour l'affichage
    pivot_data.attrs['outliers_removed'] = n_before - n_after if n_before > n_after else 0
    
    return pivot_data

# Initialisation de l'application Dash
app = dash.Dash(__name__)

# Ajouter le favicon et le titre
app.index_string = '''
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>Buchinger Science - Data</title>
        <link rel="icon" type="image/x-icon" href="/assets/favicon.ico">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <script src="https://code.highcharts.com/highcharts-more.js"></script>
        <script src="https://code.highcharts.com/modules/accessibility.js"></script>
        <script src="https://code.highcharts.com/modules/jitter.js"></script>
        <script src="https://code.highcharts.com/modules/sankey.js"></script>
        <link href="https://unpkg.com/tabulator-tables@5.6.2/dist/css/tabulator.min.css" rel="stylesheet">
        <script src="https://unpkg.com/tabulator-tables@5.6.2/dist/js/tabulator.min.js"></script>
        {%favicon%}
        {%css%}
    </head>
    <body>
        {%app_entry%}
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
'''

app.layout = html.Div([
    # Header avec image
    html.Div([
        html.Img(
            src=app.get_asset_url('img/header-img.png'),
            className="header-image",
            alt="Fasting Effects Analysis"
        ),
        html.Div([
            html.H1("How Fasting Transforms Your Body from the Inside Out ?", className="main-title"),
            html.P("Effect of fasting on blood test results", 
                   className="subtitle"),
            # Bloc texte tronqué + dégradé
            html.Div([
                html.Div(
                    "Fasting can modulate metabolic pathways, lipid profiles, glucose control, and inflammatory markers. "
                    "During a structured program, individuals often exhibit measurable changes in body composition and cardiovascular indicators. "
                    "The magnitude of these changes varies with baseline status, fasting duration, and individual physiology. "
                    "This dashboard summarizes aggregated pre/post analyses for multiple biomarkers across fasting duration groups. "
                    "While averages highlight central trends, confidence intervals provide a range of plausible effects. "
                    "Please interpret results within clinical context and consider variability across subgroups. "
                    "Outliers are filtered to ensure robust estimation, but individual responses may still differ.",
                    id="aboutShowMore",
                    className="collapsible-text"
                ),
                html.Div(id="gradient-mask", className="gradient")
            ], className="profile-biography"),
            # Barre de lecture plus / moins centrée sur la bordure basse
            html.Div([
                html.Button("Read more", id="aboutShowMoreTrigger", n_clicks=0, className="readmore-btn")
            ], className="readmore-bar", id="readmoreBar")
        ], className="header-content")
    ], className="header"),
    
    #main container open
    html.Div([
    dcc.Store(id="df-store", data=df_wide.to_dict('records')),
    dcc.Store(id="baseline-ranges-precomputed", data=BASELINE_RANGES),
    # Panneau de contrôle
        html.Div([
            html.H3("Filtering Criteria", className="section-title"),
            
            html.Div([
                # Age Category
                html.Div([
                    html.Label("Age Category"),
                    dcc.Dropdown(
                        id="age-input",
                        options=[
                            {"label": "Young adults (18-34 years)", "value": "Young adults (18-34 years)"},
                            {"label": "Middle age (35-64 years)", "value": "Middle age (35-64 years)"},
                            {"label": "Older adults (≥65 years)", "value": "Older adults (≥65 years)"}
                        ],
                        placeholder="Select age category",
                        className="dropdown",
                        searchable=False
                    )
                ], className="input-group"),
                
                # BMI Category
                html.Div([
                    html.Label("BMI Category"),
                    dcc.Dropdown(
                        id="bmi-input",
                        options=[
                            {"label": "Normal (18–24.9 kg/m²)", "value": "Normal (18–24.9 kg/m²)"},
                            {"label": "Overweight (25.0–29.9 kg/m²)", "value": "Overweight (25.0–29.9 kg/m²)"},
                            {"label": "Obesity (≥30 kg/m²)", "value": "Obesity (≥30 kg/m²)"}
                        ],
                        placeholder="Select BMI category",
                        className="dropdown",
                        searchable=False
                    )
                ], className="input-group"),
                
                # Gender
                html.Div([
                    html.Label("Gender"),
                    html.Div([
                        html.Button([
                            html.Img(
                                src=app.get_asset_url('img/icons/male.png'),
                                style={"width": "20px", "height": "20px", "marginRight": "8px"}
                            ),
                            html.Span("Male")
                        ], id="sex-button-M", n_clicks=0, className="modern-radio-button", 
                        style={"display": "flex", "alignItems": "center", "justifyContent": "center"}),
                        html.Button([
                            html.Img(
                                src=app.get_asset_url('img/icons/feminin.png'),
                                style={"width": "20px", "height": "20px", "marginRight": "8px"}
                            ),
                            html.Span("Female")
                        ], id="sex-button-F", n_clicks=0, className="modern-radio-button",
                        style={"display": "flex", "alignItems": "center", "justifyContent": "center"}),
                        dcc.Store(id="sex-input", data=None)
                    ], className="modern-radio-buttons", id="sex-radio-container")
                ], className="input-group"),
            ], className="controls-grid"),
            
        ], className="control-panel"),
        
    # Category & Parameter Selection
        html.Div([
            html.H3("Category & Parameter", className="section-title"),
            html.Div([
                # Category dropdown
                html.Div([
                    html.Label("Category"),
                    dcc.Dropdown(
                        id="category-dropdown",
                        options=[{"label": cat, "value": cat} for cat in BIOMARKER_CATEGORIES.keys()],
                        value="Cardiometabolic profile",
                        className="dropdown",
                        searchable=False,
                        clearable=False
                    )
                ], className="input-group"),
                # Parameter dropdown (will be populated based on category)
                html.Div([
                    html.Label("Parameter"),
                    dcc.Dropdown(
                        id="parameter-dropdown",
                        options=[{"label": param, "value": param} for param in BIOMARKER_CATEGORIES["Cardiometabolic profile"]],
                        value="glucose [mg/dL]",
                        className="dropdown",
                        searchable=False,
                        clearable=False
                    )
                ], className="input-group")
            ], className="controls-grid")
        ], className="category-panel"),
    
    # Résultats
        html.Div([
            # Grouping nav for charts
            dcc.Store(id="grouping-tab", data="duration"),
            html.Div([
                html.Button("By fasting duration", id="grp-btn-duration", n_clicks=0, className="cohort-tab-btn"),
                html.Button("By Gender", id="grp-btn-gender", n_clicks=0, className="cohort-tab-btn"),
                html.Button("By BMI categories", id="grp-btn-bmi", n_clicks=0, className="cohort-tab-btn"),
                html.Button("By Age categories", id="grp-btn-age", n_clicks=0, className="cohort-tab-btn"),
            ], className="cohort-nav", style={"marginBottom": "10px"}),
            # Baseline filter controls
            html.Div([
                html.Div([
                    html.Label("Filter by baseline value", style={"fontSize": "14px", "fontWeight": "500", "marginBottom": "4px"}),
                    dcc.RangeSlider(
                        id="baseline-range-slider",
                        min=0,
                        max=100,
                        value=[0, 100],
                        marks=None,
                        tooltip={"placement": "bottom", "always_visible": True},
                        allowCross=False,
                        className="baseline-range-slider"
                    )
                ], style={"padding": "10px", "paddingBottom": "0px"})
            ], style={"marginBottom": "10px"}),
            dcc.Store(id="baseline-range-store", data={"min": 0, "max": 100}),
            html.Div(id="results-info", className="results-info"),
            dcc.Loading(
                id="loading-charts",
                type="default",
                children=html.Div(id="charts-container"),
                style={"margin": "20px 0"}
            ),
            dcc.Loading(
                id="loading-table",
                type="default", 
                children=html.Div(id="data-table-container"),
                style={"margin": "20px 0"}
            )
        ], className="results-section"),
        # Section Cohort (statistiques descriptives de la cohorte filtrée)
        html.Div([
            html.H3("Patient profile", style={"marginBottom": "10px"}),
            # Nav duale pour sélectionner les deux variables du Sankey
            dcc.Store(id="sankey-var-a", data="gender"),
            dcc.Store(id="sankey-var-b", data="fasting"),
            html.Div([
                html.Div([
                    html.Span("From:", style={"marginRight": "10px"}),
                    html.Button("Age", id="sankey-a-age", n_clicks_timestamp=0, className="cohort-tab-btn"),
                    html.Button("BMI", id="sankey-a-bmi", n_clicks_timestamp=0, className="cohort-tab-btn"),
                    html.Button("Gender", id="sankey-a-gender", n_clicks_timestamp=1, className="cohort-tab-btn"),
                    html.Button("Fasting duration", id="sankey-a-fasting", n_clicks_timestamp=0, className="cohort-tab-btn"),
                ], className="cohort-nav", style={"marginBottom": "6px"}),
                html.Div([
                    html.Span("To:", style={"marginRight": "10px"}),
                    html.Button("Age", id="sankey-b-age", n_clicks_timestamp=0, className="cohort-tab-btn"),
                    html.Button("BMI", id="sankey-b-bmi", n_clicks_timestamp=0, className="cohort-tab-btn"),
                    html.Button("Gender", id="sankey-b-gender", n_clicks_timestamp=0, className="cohort-tab-btn"),
                    html.Button("Fasting duration", id="sankey-b-fasting", n_clicks_timestamp=1, className="cohort-tab-btn"),
                ], className="cohort-nav", style={"marginBottom": "10px"}),
            ]),
            dcc.Loading(
                id="loading-cohort-stats",
                type="default",
                children=html.Div(id="cohort-stats-container", style={"marginTop": "12px"})
            )
        ], style={"marginTop": "30px"}),
    #main container close
    
    ], className="main-container"),
    # Footer
    html.Footer([
        html.Div([
            html.Div([
                html.Div([
                    html.Span([
                        f"© {datetime.now().year} Buchinger Wilhelmi",
                        html.Span("   ", style={"margin": "0 10px"}),
                        html.A("Legal Notice", href="https://www.buchinger-wilhelmi.com/fr/impressum/", 
                               style={"color": "#ffffff", "textDecoration": "none", "fontWeight": "300"}),
                        html.Span("   ", style={"margin": "0 10px"}),
                        html.A("Privacy Policy", href="https://www.buchinger-wilhelmi.com/fr/datenschutz/", 
                               style={"color": "#ffffff", "textDecoration": "none", "fontWeight": "300"}),
                        html.Span("   ", style={"margin": "0 10px"}),
                        html.A("Terms & Conditions – Bodensee Clinic", 
                               href="https://www.buchinger-wilhelmi.com/fr/agb-und-klinikordnung-bodensee/", 
                               style={"color": "#ffffff", "textDecoration": "none", "fontWeight": "300"}),
                        html.Span("   ", style={"margin": "0 10px"}),
                        html.A("Terms & Conditions – Marbella Clinic", 
                               href="https://www.buchinger-wilhelmi.com/fr/agb-und-klinikordnung-marbella/", 
                               style={"color": "#ffffff", "textDecoration": "none", "fontWeight": "300"}), 
                        html.Div([
                            html.Span("All rights reserved.", style={"color": "#ffffff", "fontWeight": "300", "textAlign": "center", "display": "block", "marginTop": "20px"})
                        ], style={"textAlign": "center"})

                    ], style={"color": "#ffffff", "fontWeight": "300"})
                ], className="footer-left"),
                html.Div(className="footer-clear")
            ], className="footer-wrap"),
        ], className="footer-container")
    ], className="footer")
    
], className="app-container")


app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='toggleReadMore'),
    Output("aboutShowMore", "style"),
    Output("aboutShowMoreTrigger", "className"),
    Output("gradient-mask", "style"),
    Output("readmoreBar", "style"),
    Output("aboutShowMoreTrigger", "children"),
    Input("aboutShowMoreTrigger", "n_clicks"),
)

# Callback pour mettre à jour les options du paramètre selon la catégorie
@app.callback(
    Output("parameter-dropdown", "options"),
    Output("parameter-dropdown", "value"),
    Input("category-dropdown", "value")
)
def update_parameter_options(category):
    if category and category in BIOMARKER_CATEGORIES:
        parameters = BIOMARKER_CATEGORIES[category]
        options = [{"label": format_parameter_display_name(param), "value": param} for param in parameters]
        # Sélectionner le premier paramètre par défaut
        default_value = parameters[0] if parameters else None
        return options, default_value
    return [], None

# Callback clientside optimisé pour mettre à jour le RangeSlider (utilise les valeurs pré-calculées)
app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='updateBaselineRange'),
    Output("baseline-range-slider", "min"),
    Output("baseline-range-slider", "max"),
    Output("baseline-range-slider", "value"),
    Output("baseline-range-store", "data"),
    Input("parameter-dropdown", "value"),
    Input("baseline-ranges-precomputed", "data")
)

# Callback client pour l'analyse (figures, tableau, infos)
app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='updateAnalysis'),
    Output("results-info", "children"),
    Output("charts-container", "children"),
    Output("data-table-container", "children"),
    Input("df-store", "data"),
    Input("grouping-tab", "data"),
    Input("age-input", "value"),
    Input("bmi-input", "value"),
    Input("sex-input", "data"),
    Input("category-dropdown", "value"),
    Input("parameter-dropdown", "value"),
    Input("baseline-range-slider", "value"),
)

# Cohort statistics section (Sankey diagram)
app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='updateCohortStats'),
    Output("cohort-stats-container", "children"),
    Input("df-store", "data"),
    Input("age-input", "value"),
    Input("bmi-input", "value"),
    Input("sex-input", "data"),
    Input("sankey-var-a", "data"),
    Input("sankey-var-b", "data"),
    Input("parameter-dropdown", "value"),
    Input("baseline-range-slider", "value"),
)

# Switch charts grouping tab
app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='switchGroupingTab'),
    Output("grouping-tab", "data"),
    Input("grp-btn-duration", "n_clicks_timestamp"),
    Input("grp-btn-gender", "n_clicks_timestamp"),
    Input("grp-btn-bmi", "n_clicks_timestamp"),
    Input("grp-btn-age", "n_clicks_timestamp"),
    State("grouping-tab", "data")
)

# Update grouping buttons classes
app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='updateGroupingTabClasses'),
    Output("grp-btn-duration", "className"),
    Output("grp-btn-gender", "className"),
    Output("grp-btn-bmi", "className"),
    Output("grp-btn-age", "className"),
    Input("grouping-tab", "data")
)

# Switch Sankey variable A (from)
app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='switchSankeyVarA'),
    Output("sankey-var-a", "data"),
    Input("sankey-a-age", "n_clicks_timestamp"),
    Input("sankey-a-bmi", "n_clicks_timestamp"),
    Input("sankey-a-gender", "n_clicks_timestamp"),
    Input("sankey-a-fasting", "n_clicks_timestamp"),
    State("sankey-var-a", "data"),
    State("sankey-var-b", "data")
)

app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='updateSankeyVarAClasses'),
    Output("sankey-a-age", "className"),
    Output("sankey-a-bmi", "className"),
    Output("sankey-a-gender", "className"),
    Output("sankey-a-fasting", "className"),
    Input("sankey-var-a", "data")
)

app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='updateSankeyVarADisabled'),
    Output("sankey-a-age", "disabled"),
    Output("sankey-a-bmi", "disabled"),
    Output("sankey-a-gender", "disabled"),
    Output("sankey-a-fasting", "disabled"),
    Input("sankey-var-b", "data")
)

# Switch Sankey variable B (to)
app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='switchSankeyVarB'),
    Output("sankey-var-b", "data"),
    Input("sankey-b-age", "n_clicks_timestamp"),
    Input("sankey-b-bmi", "n_clicks_timestamp"),
    Input("sankey-b-gender", "n_clicks_timestamp"),
    Input("sankey-b-fasting", "n_clicks_timestamp"),
    State("sankey-var-b", "data"),
    State("sankey-var-a", "data")
)

app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='updateSankeyVarBClasses'),
    Output("sankey-b-age", "className"),
    Output("sankey-b-bmi", "className"),
    Output("sankey-b-gender", "className"),
    Output("sankey-b-fasting", "className"),
    Input("sankey-var-b", "data")
)

app.clientside_callback(
    ClientsideFunction(namespace='ui', function_name='updateSankeyVarBDisabled'),
    Output("sankey-b-age", "disabled"),
    Output("sankey-b-bmi", "disabled"),
    Output("sankey-b-gender", "disabled"),
    Output("sankey-b-fasting", "disabled"),
    Input("sankey-var-a", "data")
)

def create_category_results(filtered_df, category, parameters):
    """
    Crée les résultats pour une catégorie de paramètres
    """
    results = {}
    total_patients = 0
    
    for parameter in parameters:
        param_data = get_pre_post_data(filtered_df, parameter)
        if not param_data.empty:
            results[parameter] = param_data
            total_patients = max(total_patients, len(param_data))
    
    return results, total_patients

def create_summary_table(category_results, category):
    """
    Crée un tableau résumé pour une catégorie
    """
    if not category_results:
        return html.Div("No data available for this category")
    
    # Préparer les données pour le tableau
    table_data = []
    category_order = ['3-7 days', '8-12 days', '13-17 days', '18+ days']
    
    for parameter, param_data in category_results.items():
        display_name = format_parameter_display_name(parameter)
        row = {'Parameter': display_name}
        
        # Ordonner les données par catégorie de durée
        param_data['length_of_fasting_cat'] = pd.Categorical(
            param_data['length_of_fasting_cat'], 
            categories=category_order, 
            ordered=True
        )
        
        # Calculer les statistiques par durée
        try:
            stats = param_data.groupby('length_of_fasting_cat', observed=True).agg({
                'Delta_pct': ['mean', 'std', 'count']
            }).round(1)
        except Exception:
            # Si le groupby échoue, passer au paramètre suivant
            continue
        
        for duration in category_order:
            if duration in stats.index:
                mean_change = stats.loc[duration, ('Delta_pct', 'mean')]
                std_change = stats.loc[duration, ('Delta_pct', 'std')]
                n_count = stats.loc[duration, ('Delta_pct', 'count')]
                
                # Calculer IC95 seulement si on a assez de données
                if n_count > 1 and not pd.isna(std_change) and std_change > 0:
                    se = std_change / np.sqrt(n_count)
                    ci_lower = mean_change - 1.96 * se
                    ci_upper = mean_change + 1.96 * se
                    row[duration] = f"{mean_change:.1f} [{ci_lower:.1f}; {ci_upper:.1f}]"
                else:
                    row[duration] = f"{mean_change:.1f} [N/A]"
            else:
                row[duration] = "N/A"
        
        table_data.append(row)
    
    # Créer le tableau Dash
    columns = [{"name": "Parameter", "id": "Parameter"}] + [
        {"name": duration, "id": duration} for duration in category_order
    ]
    
    return dash_table.DataTable(
        data=table_data,
        columns=columns,
        style_cell={'textAlign': 'center', 'fontFamily': 'Lato, sans-serif'},
        style_header={'backgroundColor': '#f8f9fa', 'fontWeight': 'bold'},
        style_data={'backgroundColor': 'white'},
        style_table={'margin': '20px 0'}
    )

@app.callback(
    Output("sex-input", "data"),
    [Input("sex-button-M", "n_clicks"),
     Input("sex-button-F", "n_clicks")],
    [State("sex-input", "data")]
)
def update_sex_selection(btn_m_clicks, btn_f_clicks, current_sex):
    ctx = dash.callback_context
    if not ctx.triggered:
        return current_sex
    
    button_id = ctx.triggered[0]["prop_id"].split(".")[0]
    
    if button_id == "sex-button-M":
        # Si c'est déjà sélectionné, désélectionner
        if current_sex == "M":
            return None
        return "M"
    elif button_id == "sex-button-F":
        # Si c'est déjà sélectionné, désélectionner
        if current_sex == "F":
            return None
        return "F"
    
    return current_sex

@app.callback(
    [Output("sex-button-M", "className"),
     Output("sex-button-F", "className")],
    [Input("sex-input", "data")]
)
def update_button_styles(sex):
    if sex == "M":
        return "modern-radio-button selected", "modern-radio-button"
    elif sex == "F":
        return "modern-radio-button", "modern-radio-button selected"
    else:
        return "modern-radio-button", "modern-radio-button"

"""
Le callback serveur est remplacé par un callback client pour les performances.
"""

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=False, port=8050)


