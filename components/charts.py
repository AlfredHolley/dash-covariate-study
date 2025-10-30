"""
Composants de graphiques et tableaux
"""

from dash import dcc, html, dash_table
import plotly.graph_objects as go
import numpy as np


def create_charts_container():
    """Crée le conteneur principal des graphiques"""
    return html.Div([
        html.H2("Biomarker Evolution", style={
            'fontSize': '1.8rem',
            'fontWeight': '300',
            'color': '#2c2c2c',
            'marginBottom': '30px',
            'textAlign': 'center'
        }),
        
        # Lipid Profile Chart
        html.Div([
            html.H3("Lipid Profile", style={
                'fontSize': '1.4rem',
                'fontWeight': '400',
                'color': '#2c2c2c',
                'marginBottom': '20px',
                'textAlign': 'center'
            }),
            dcc.Graph(id='lipid-chart', config={'displayModeBar': False}),
        ], id='lipid-container', style={
            'background': '#fafafa',
            'borderRadius': '12px',
            'padding': '25px',
            'marginBottom': '30px',
            'display': 'none'
        }),
        
        # Glucose Chart
        html.Div([
            html.H3("Glucose Metabolism", style={
                'fontSize': '1.4rem',
                'fontWeight': '400',
                'color': '#2c2c2c',
                'marginBottom': '20px',
                'textAlign': 'center'
            }),
            dcc.Graph(id='glucose-chart', config={'displayModeBar': False}),
        ], id='glucose-container', style={
            'background': '#fafafa',
            'borderRadius': '12px',
            'padding': '25px',
            'marginBottom': '30px',
            'display': 'none'
        }),
        
        # Liver Function Chart
        html.Div([
            html.H3("Liver Function", style={
                'fontSize': '1.4rem',
                'fontWeight': '400',
                'color': '#2c2c2c',
                'marginBottom': '20px',
                'textAlign': 'center'
            }),
            dcc.Graph(id='liver-chart', config={'displayModeBar': False}),
        ], id='liver-container', style={
            'background': '#fafafa',
            'borderRadius': '12px',
            'padding': '25px',
            'marginBottom': '30px',
            'display': 'none'
        }),
        
        # Statistical Summary Table
        html.Div([
            html.H3("Statistical Summary - 95% Confidence Intervals", style={
                'fontSize': '1.4rem',
                'fontWeight': '400',
                'color': '#2c2c2c',
                'marginBottom': '20px',
                'textAlign': 'center'
            }),
            dash_table.DataTable(
                id='stats-table',
                columns=[
                    {'name': 'Biomarker', 'id': 'biomarker'},
                    {'name': 'Initial Value', 'id': 'initial'},
                    {'name': 'Final Value (Day 14)', 'id': 'final'},
                    {'name': 'Reduction (%)', 'id': 'reduction'},
                    {'name': '95% CI Lower', 'id': 'ci_lower'},
                    {'name': '95% CI Upper', 'id': 'ci_upper'},
                    {'name': 'Unit', 'id': 'unit'}
                ],
                style_cell={
                    'textAlign': 'center',
                    'fontFamily': 'Lato, Open Sans, sans-serif',
                    'fontSize': '14px',
                    'padding': '12px'
                },
                style_header={
                    'backgroundColor': '#f8f9fa',
                    'fontWeight': 'bold',
                    'color': '#2c2c2c',
                    'border': '1px solid #e0e0e0'
                },
                style_data={
                    'backgroundColor': 'white',
                    'color': '#3a3a3a',
                    'border': '1px solid #e8e8e8'
                },
                style_data_conditional=[
                    {
                        'if': {'row_index': 'odd'},
                        'backgroundColor': '#fafafa'
                    }
                ]
            ),
        ], id='stats-container', style={
            'background': '#fafafa',
            'borderRadius': '12px',
            'padding': '25px',
            'marginBottom': '30px',
            'display': 'none'
        }),
        
    ], id='chart-container', className='chart-container', style={
        'background': 'white',
        'borderRadius': '16px',
        'padding': '40px',
        'marginBottom': '40px',
        'boxShadow': '0 2px 20px rgba(0, 0, 0, 0.04)',
        'display': 'none'  # Hidden initially
    })


def create_boxplot_chart(category_results, title_suffix, y_title, duration_groups, fasting_days):
    """Crée un graphique boxplot pour une catégorie de biomarqueurs"""
    fig = go.Figure()
    
    if not category_results:
        fig.add_annotation(
            text=f"No {title_suffix.lower()} parameters provided",
            xref="paper", yref="paper",
            x=0.5, y=0.5, showarrow=False,
            font=dict(size=14, color="#8a8a8a")
        )
    else:
        for biomarker, data in category_results.items():
            sims = data['simulations']
            
            # Create data for each duration group
            for group_name, days_in_group in duration_groups.items():
                # Get indices for days in this group
                day_indices = [i for i, day in enumerate(fasting_days) if day in days_in_group]
                
                if day_indices:
                    # Collect all values for this group
                    group_values = []
                    for day_idx in day_indices:
                        group_values.extend(sims[:, day_idx])
                    
                    fig.add_trace(go.Box(
                        y=group_values,
                        x=[group_name] * len(group_values),
                        name=biomarker,
                        marker_color=data['color'],
                        boxpoints='outliers',
                        jitter=0.3,
                        pointpos=-1.8,
                        line_width=2,
                        fillcolor=data['color'],
                        opacity=0.7,
                        hovertemplate=f"<b>{biomarker}</b><br>" +
                                      f"Period: {group_name}<br>" +
                                      f"Value: %{{y:.2f}} {data['unit']}<br>" +
                                      "<extra></extra>"
                    ))
    
    fig.update_layout(
        template='plotly_white',
        height=400,
        xaxis=dict(
            title="Fasting Duration Groups",
            titlefont=dict(size=12, color="#5a5a5a"),
            showgrid=True,
            gridcolor='#f0f0f0',
            zeroline=False
        ),
        yaxis=dict(
            title=y_title,
            titlefont=dict(size=12, color="#5a5a5a"),
            showgrid=True,
            gridcolor='#f0f0f0',
            zeroline=False
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="center",
            x=0.5,
            bgcolor="rgba(255, 255, 255, 0.9)",
            bordercolor="#e0e0e0",
            borderwidth=1
        ),
        plot_bgcolor='white',
        paper_bgcolor='white',
        font=dict(family="Lato, Open Sans, sans-serif", color="#3a3a3a"),
        margin=dict(t=60, b=40, l=60, r=40),
        boxmode='group'
    )
    
    return fig


def create_statistics_table_data(results):
    """Crée les données pour le tableau statistique"""
    stats_data = []
    for biomarker, data in results.items():
        initial_val = data['initial']
        final_vals = data['simulations'][:, -1]  # Day 21 values
        
        # Calculate statistics
        final_mean = np.mean(final_vals)
        reduction_pct = ((initial_val - final_mean) / initial_val) * 100
        
        # 95% confidence interval for reduction percentage
        reductions = ((initial_val - final_vals) / initial_val) * 100
        ci_lower, ci_upper = np.percentile(reductions, [2.5, 97.5])
        
        stats_data.append({
            'biomarker': biomarker,
            'initial': f"{initial_val:.2f}",
            'final': f"{final_mean:.2f}",
            'reduction': f"{reduction_pct:.1f}%",
            'ci_lower': f"{ci_lower:.1f}%",
            'ci_upper': f"{ci_upper:.1f}%",
            'unit': data['unit']
        })
    
    return stats_data
