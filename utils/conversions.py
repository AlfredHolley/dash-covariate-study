"""
Utilitaires pour les conversions d'unités
"""

def convert_units(value, from_unit, to_unit, biomarker_type):
    """
    Convertit les unités entre mmol/L et mg/dL pour les biomarqueurs lipidiques et le glucose
    """
    if value is None:
        return None
    
    # Facteurs de conversion (mmol/L vers mg/dL)
    conversion_factors = {
        'ldl': 38.67,           # LDL cholesterol
        'cholesterol': 38.67,   # Total cholesterol  
        'glucose': 18.02        # Glucose
    }
    
    if biomarker_type not in conversion_factors:
        return value  # Pas de conversion pour les enzymes hépatiques
    
    factor = conversion_factors[biomarker_type]
    
    if from_unit == 'mmol' and to_unit == 'mg':
        return value * factor
    elif from_unit == 'mg' and to_unit == 'mmol':
        return value / factor
    else:
        return value


def get_unit_label(unit_type, biomarker_type):
    """
    Retourne le label d'unité approprié selon le type de biomarqueur et l'unité sélectionnée
    """
    if biomarker_type in ['ldl', 'cholesterol', 'glucose']:
        return 'mg/dL' if unit_type == 'mg' else 'mmol/L'
    else:
        return 'U/L'  # Les enzymes hépatiques restent toujours en U/L
