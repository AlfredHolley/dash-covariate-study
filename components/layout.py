"""
Composants de mise en page de l'interface utilisateur
"""

from dash import dcc, html


def create_header():
    """Crée la section d'en-tête de l'application"""
    return html.Div([
        html.Div([
            html.Img(src='/assets/img/logo_bw.svg', style={'maxWidth': '200px', 'marginBottom': '20px'}),
        ], className='logo-container'),
        
        html.H1("Fasting Effects Simulation", style={'marginBottom': '20px'}),
        html.P(
            "Explore how fasting affects your metabolism based on your "
            "body composition and biomarkers. This simulation is inspired "
            "by Buchinger Wilhelmi's fasting medicine principles.",
            style={'fontSize': '1.1rem', 'color': '#6a6a6a', 'maxWidth': '700px', 'margin': '0 auto', 'lineHeight': '1.8'}
        ),
        html.P(
            "💡 You can run the simulation even without entering any data - "
            "the app will use population averages to provide default estimates!",
            style={'fontSize': '0.95rem', 'color': '#8a8a8a', 'maxWidth': '600px', 'margin': '15px auto 0', 'fontStyle': 'italic', 'lineHeight': '1.6'}
        ),
    ], className='header-section', style={
        'textAlign': 'center',
        'marginBottom': '60px',
        'padding': '40px 20px',
        'background': 'white',
        'borderRadius': '16px',
        'boxShadow': '0 2px 20px rgba(0, 0, 0, 0.04)'
    })


def create_body_composition_section():
    """Crée la section de composition corporelle"""
    return html.Div([
        html.H2("Body Composition", className='section-title', style={
            'fontSize': '1.5rem',
            'fontWeight': '400',
            'color': '#2c2c2c',
            'marginBottom': '30px',
            'paddingBottom': '15px',
            'borderBottom': '1px solid #e8e8e8'
        }),
        html.Div([
            html.Div([
                html.Label("Weight (kg)"),
                dcc.Input(id='weight', type='number', placeholder='e.g. 75', min=30, max=200),
            ], style={'marginBottom': '20px'}),
            
            html.Div([
                html.Label("Height (cm)"),
                dcc.Input(id='height', type='number', placeholder='e.g. 175', min=100, max=250),
            ], style={'marginBottom': '20px'}),
            
            html.Div([
                html.Label("Gender", style={'marginBottom': '10px', 'display': 'block'}),
                dcc.RadioItems(
                    id='gender',
                    options=[
                        {'label': html.Div(['♂ Male'], style={'display': 'flex', 'alignItems': 'center', 'gap': '8px'}), 'value': 'male'},
                        {'label': html.Div(['♀ Female'], style={'display': 'flex', 'alignItems': 'center', 'gap': '8px'}), 'value': 'female'}
                    ],
                    className='modern-radio-buttons',
                    labelStyle={'display': 'block', 'marginBottom': '12px'},
                    inputStyle={'marginRight': '10px'}
                ),
            ], style={'marginBottom': '20px'}),
            
            html.Div([
                html.Label("Age (years)"),
                dcc.Input(id='age', type='number', placeholder='e.g. 45', min=18, max=100),
            ], style={'marginBottom': '20px'}),
        ], className='input-grid', style={
            'display': 'grid',
            'gridTemplateColumns': 'repeat(auto-fit, minmax(250px, 1fr))',
            'gap': '25px',
            'marginBottom': '30px'
        }),
    ], className='input-group', style={'marginBottom': '40px'})


def create_metabolic_parameters_section():
    """Crée la section des paramètres métaboliques"""
    return html.Div([
        html.H2("Metabolic Parameters", className='section-title', style={
            'fontSize': '1.5rem',
            'fontWeight': '400',
            'color': '#2c2c2c',
            'marginBottom': '30px',
            'paddingBottom': '15px',
            'borderBottom': '1px solid #e8e8e8'
        }),
        html.Div([
            html.Div([
                html.Label("LDL (mmol/L)"),
                dcc.Input(id='ldl', type='number', placeholder='e.g. 3.5', min=0, max=10, step=0.1),
            ], style={'marginBottom': '20px'}),
            
            html.Div([
                html.Label("Fasting Glucose (mmol/L)"),
                dcc.Input(id='glucose', type='number', placeholder='e.g. 5.5', min=0, max=20, step=0.1),
            ], style={'marginBottom': '20px'}),
            
            html.Div([
                html.Label("Total Cholesterol (mmol/L)"),
                dcc.Input(id='cholesterol', type='number', placeholder='e.g. 5.0', min=0, max=15, step=0.1),
            ], style={'marginBottom': '20px'}),
            
            html.Div([
                html.Label("GGT (U/L)"),
                dcc.Input(id='ggt', type='number', placeholder='e.g. 30', min=0, max=300, step=1),
            ], style={'marginBottom': '20px'}),
            
            html.Div([
                html.Label("GPT/ALT (U/L)"),
                dcc.Input(id='gpt', type='number', placeholder='e.g. 25', min=0, max=300, step=1),
            ], style={'marginBottom': '20px'}),
            
            html.Div([
                html.Label("Alkaline Phosphatase (U/L)"),
                dcc.Input(id='ap', type='number', placeholder='e.g. 70', min=0, max=500, step=1),
            ], style={'marginBottom': '20px'}),
        ], className='input-grid', style={
            'display': 'grid',
            'gridTemplateColumns': 'repeat(auto-fit, minmax(250px, 1fr))',
            'gap': '25px',
            'marginBottom': '30px'
        }),
    ], className='input-group')


def create_unit_switch():
    """Crée le switcher d'unités"""
    return html.Div([
        html.Label("Units for Lipids & Glucose:", style={
            'fontSize': '1rem',
            'fontWeight': '400',
            'color': '#2c2c2c',
            'marginBottom': '15px',
            'display': 'block',
            'textAlign': 'center'
        }),
        html.Div([
            dcc.RadioItems(
                id='unit-switch',
                options=[
                    {'label': html.Div(['mmol/L'], style={'display': 'flex', 'alignItems': 'center', 'gap': '8px'}), 'value': 'mmol'},
                    {'label': html.Div(['mg/dL'], style={'display': 'flex', 'alignItems': 'center', 'gap': '8px'}), 'value': 'mg'}
                ],
                value='mmol',
                className='unit-switch-buttons',
                labelStyle={'display': 'inline-block', 'marginRight': '25px'},
                inputStyle={'marginRight': '8px'}
            ),
        ], style={'textAlign': 'center'}),
    ], style={
        'background': '#f8f9fa',
        'borderRadius': '12px',
        'padding': '20px',
        'marginBottom': '30px',
        'border': '1px solid #e0e0e0'
    })


def create_run_button():
    """Crée le bouton de simulation"""
    return html.Div([
        html.Button("Run Simulation", id='run-button', n_clicks=0),
    ], className='button-container', style={'textAlign': 'center', 'margin': '40px 0'})


def create_footer():
    """Crée le pied de page"""
    return html.Div([
        html.P(
            "Inspired by Buchinger Wilhelmi's fasting medicine philosophy",
            style={'color': '#8a8a8a', 'fontStyle': 'italic'}
        ),
    ], className='footer', style={
        'textAlign': 'center',
        'padding': '30px',
        'borderTop': '1px solid #e8e8e8',
        'marginTop': '60px'
    })
