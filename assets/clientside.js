// Client-side callbacks for Dash
// This file is automatically served by Dash from the assets/ directory

window.dash_clientside = Object.assign({}, window.dash_clientside, {
  ui: {
    updateBaselineRange: function(parameter, baselineRanges) {
      // Callback clientside ultra-rapide qui lit simplement les valeurs pré-calculées
      if (!parameter || !baselineRanges || !baselineRanges[parameter]) {
        return [0, 100, [0, 100], {min: 0, max: 100}];
      }
      
      var range = baselineRanges[parameter];
      var minVal = range.min || 0;
      var maxVal = range.max || 100;
      
      return [minVal, maxVal, [minVal, maxVal], {min: minVal, max: maxVal}];
    },
    switchSankeyVarA: function(tAge, tBmi, tGender, tFasting, current, varB){
      var ts=[tAge||0,tBmi||0,tGender||0,tFasting||0]; var max=Math.max.apply(null,ts); if(!max) return current||'gender'; var idx=ts.indexOf(max); var selected=['age','bmi','gender','fasting'][idx]; if(selected===varB) return current||'gender'; return selected;
    },
    updateSankeyVarAClasses: function(active){ var base='cohort-tab-btn'; var keys=['age','bmi','gender','fasting']; return keys.map(function(k){ return (k===(active||'gender'))?base+' selected':base; }); },
    updateSankeyVarADisabled: function(varB){ var keys=['age','bmi','gender','fasting']; return keys.map(function(k){ return k===varB; }); },
    switchSankeyVarB: function(tAge, tBmi, tGender, tFasting, current, varA){
      var ts=[tAge||0,tBmi||0,tGender||0,tFasting||0]; var max=Math.max.apply(null,ts); if(!max) return current||'fasting'; var idx=ts.indexOf(max); var selected=['age','bmi','gender','fasting'][idx]; if(selected===varA) return current||'fasting'; return selected;
    },
    updateSankeyVarBClasses: function(active){ var base='cohort-tab-btn'; var keys=['age','bmi','gender','fasting']; return keys.map(function(k){ return (k===(active||'fasting'))?base+' selected':base; }); },
    updateSankeyVarBDisabled: function(varA){ var keys=['age','bmi','gender','fasting']; return keys.map(function(k){ return k===varA; }); },
    switchGroupingTab: function(t1, t2, t3, t4, current) {
      var ts = [t1||0, t2||0, t3||0, t4||0];
      var max = Math.max.apply(null, ts);
      if (!max || max <= 0) return current || 'duration';
      var idx = ts.indexOf(max);
      return ['duration','gender','bmi','age'][idx];
    },
    updateGroupingTabClasses: function(active) {
      var base = 'cohort-tab-btn';
      var keys = ['duration','gender','bmi','age'];
      return keys.map(function(k){ return k === (active||'duration') ? base + ' selected' : base; });
    },
    switchCohortStatsTab: function(t1, t2, t3, current) {
      // Utiliser les timestamps pour choisir le dernier bouton cliqué
      var ts = [t1||0, t2||0, t3||0];
      var max = Math.max.apply(null, ts);
      if (!max || max <= 0) return current || 'age';
      var idx = ts.indexOf(max);
      return ['age','bmi','gender'][idx];
    },
    updateCohortStatsTabClasses: function(active) {
      var base = 'cohort-tab-btn';
      var keys = ['age','bmi','gender'];
      return keys.map(function(k){ return k === (active||'age') ? base + ' selected' : base; });
    },
    updateAnalysis: function(data, groupingTab, age_cat, bmi_cat, sex, category, parameter, baselineRange) {
      if (!data || !category || !parameter) {
        return [
          { 'props': { 'children': [{'props': {'children': 'Select a category and parameter to start the analysis', 'style': {'color': '#6c757d', 'marginBottom': '20px', 'textAlign': 'center'}}, 'type': 'H4', 'namespace': 'dash_html_components'}] }, 'type': 'Div', 'namespace': 'dash_html_components' },
          '',
          ''
        ];
      }

      // Fonction pour formater le nom du paramètre avec nom complet
      function formatParameterName(param) {
        var replacements = {
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
        };
        return replacements[param] || param.replace('[', '(').replace(']', ')');
      }

      var CATEGORIES = {
        'Hepatic health': ['ALP [U/L]', 'GGT [U/L]', 'GOT AST [U/L]', 'GPT ALT [U/L]', 'FLI'],
        'Cardiometabolic profile': ['TC [mg/dL]', 'LDL [mg/dL]',  'HDL [mg/dL]','TG [mg/dL]', 'SBP [mmHg]', 'DBP [mmHg]', 'glucose [mg/dL]', 'HBA1C [mmol/mol]', 'TSH [µU/mL]'],
        'Body composition': ['BMI [kg/m²]', 'weight [kg]', 'WC [cm]'],
        'Renal function & Electrolytes': ['creatinine [mg/dL]', 'GFR [mL/min/1.73m²]', 'urea [mg/dL]', 'uric acid [mg/dL]', 'K [mmol/L]', 'Na [mmol/L]', 'Mg [mg/dL]', 'Ca [mg/dL]'],
        'Blood & Immunity': [ 'quick [%]', 'erythrocytes [T/L]', 'hemoglobin [g/dL]', 'hematocrit [%]', 'thrombocytes [G/L]','MCV [fL]', 'MCH [pg]', 'MCHC [g/dL]'],
        'Inflammation': ['CRP hs [mg/L]', 'ESR 1H [mm/h]', 'ESR 2H [mm/h]', 'leukocytes [G/L]'],
      };
      // Grouping config
      var grouping = (groupingTab || 'duration');
      var xField, CATEGORY_ORDER, CATEGORY_SHORT, CATEGORY_LABELS, DISPLAY_MAP;
      var CAT_COLORS;
      if (grouping === 'gender') {
        xField = 'sex'; CATEGORY_ORDER = ['M','F']; CATEGORY_SHORT = ['Male','Female']; CATEGORY_LABELS = ['<b>Male</b>','<b>Female</b>']; DISPLAY_MAP = {'M':'Male','F':'Female'}; CAT_COLORS = ['#4a90e2','#f45b69'];
      } else if (grouping === 'bmi') {
        xField = 'BMI_cat'; CATEGORY_ORDER = ['Normal (18–24.9 kg/m²)','Overweight (25.0–29.9 kg/m²)','Obesity (≥30 kg/m²)']; CATEGORY_SHORT = ['Normal', 'Overweight', 'Obesity']; CATEGORY_LABELS = ['<b>Normal</b><br/>(18–24.9)', '<b>Overweight</b><br/>(25.0–29.9)', '<b>Obesity</b><br/>(≥30)']; CAT_COLORS = ['#50e3c2','#f5a623','#d0021b'];
      } else if (grouping === 'age') {
        xField = 'age_cat'; CATEGORY_ORDER = ['Young adults (18-34 years)','Middle age (35-64 years)','Older adults (≥65 years)']; CATEGORY_SHORT = ['18-34','35-64','65+']; CATEGORY_LABELS = ['<b>Young Adults</b><br/>(18-34)','<b>Middle Adults</b><br/>(35-64)','<b>Older Adults</b><br/>(65+)']; CAT_COLORS = ['#7ed321','#4a90e2','#bd10e0'];
      } else {
        xField = 'length_of_fasting_cat'; CATEGORY_ORDER = ['3-7 days', '8-12 days', '13-17 days', '18+ days']; CATEGORY_SHORT = ['3-7','8-12','13-17','18+']; CATEGORY_LABELS = ['<b>3-7 days</b>', '<b>8-12 days</b>', '<b>13-17 days</b>', '<b>18+ days</b>']; CAT_COLORS = ['#4a90e2','#50e3c2','#f5a623','#d0021b'];
      }

      // Vérifier que le paramètre sélectionné est valide pour la catégorie
      var validParams = CATEGORIES[category] || [];
      if (validParams.indexOf(parameter) === -1) {
        return ['Invalid parameter for selected category', '', ''];
      }

      // Utiliser uniquement le paramètre sélectionné
      var params = [parameter];

      // Filtrage
      var rows = data.filter(function(r){
        var ok = true;
        if (age_cat) ok = ok && r.age_cat === age_cat;
        if (bmi_cat) ok = ok && r.BMI_cat === bmi_cat;
        if (sex) ok = ok && r.sex === sex;
        return ok;
      });

      // Regrouper par meta_id
      var byId = {};
      rows.forEach(function(r){
        var id = r.meta_id;
        if (!byId[id]) byId[id] = { pre: {}, post: {}, meta: { length_of_fasting_cat: r.length_of_fasting_cat, sex: r.sex, BMI_cat: r.BMI_cat, age_cat: r.age_cat } };
        var tp = r.timepoint;
        params.forEach(function(p){
          var val = r[p];
          if (val !== null && val !== undefined && val !== '') {
            if (tp === 'Pre') byId[id].pre[p] = Number(val);
            if (tp === 'Post') byId[id].post[p] = Number(val);
          }
        });
      });

      // Construire deltas pour le paramètre sélectionné (un seul graphique)
      var charts = [];
      var totalIds = new Set();
      var tableRows = {};
      var headerCounts = null;
      var p = params[0]; // Un seul paramètre
      
        // Extraire le range baseline pour le filtrage
        var baselineMin = (baselineRange && Array.isArray(baselineRange) && baselineRange.length >= 2) ? Number(baselineRange[0]) : null;
        var baselineMax = (baselineRange && Array.isArray(baselineRange) && baselineRange.length >= 2) ? Number(baselineRange[1]) : null;
        
        var xs = []; var ys = []; var patientIds = [];
        var perCat = {}; CATEGORY_ORDER.forEach(function(c){ perCat[c] = []; });
        var baselinePerCat = {}; CATEGORY_ORDER.forEach(function(c){ baselinePerCat[c] = []; }); // Stocker les valeurs baseline
        Object.keys(byId).forEach(function(id){
          var rec = byId[id];
          var catKey = rec.meta[xField];
          if (rec.pre[p] !== undefined && rec.post[p] !== undefined && catKey) {
            // Filtrer selon le range baseline
            var baselineValue = rec.pre[p];
            var inRange = true;
            if (baselineMin !== null && baselineMax !== null && isFinite(baselineMin) && isFinite(baselineMax)) {
              inRange = (baselineValue >= baselineMin && baselineValue <= baselineMax);
            }
            
            if (inRange) {
              var delta = rec.post[p] - rec.pre[p];
              var cat = catKey;
              if (CATEGORY_ORDER.indexOf(cat) !== -1 && isFinite(delta)) {
                xs.push(cat); ys.push(delta); patientIds.push(id);
                perCat[cat].push(delta);
                baselinePerCat[cat].push(baselineValue); // Stocker la baseline
                totalIds.add(id);
              }
            }
          }
        });

        // Filtrer les outliers (z-score > 4) pour GPT, GOT et GGT
        var OUTLIER_PARAMS = { 'GOT AST [U/L]': true, 'GPT ALT [U/L]': true, 'GGT [U/L]': true };
        if (OUTLIER_PARAMS[p]) {
          var xs2 = []; var ys2 = []; var patientIds2 = [];
          CATEGORY_ORDER.forEach(function(cat){
            var arr = perCat[cat];
            if (arr.length > 1) {
              var m = arr.reduce((a,b)=>a+b,0) / arr.length;
              var variance = arr.reduce((a,b)=>a + Math.pow(b-m,2),0) / (arr.length - 1);
              var sd = Math.sqrt(Math.max(variance, 0));
              var filtered = (sd > 0) ? arr.filter(function(v){ return Math.abs((v - m)/sd) <= 3.5; }) : arr;
              perCat[cat] = filtered;
            }
            // reconstruire xs/ys/patientIds depuis perCat en gardant la correspondance
            var catIndices = [];
            for (var j = 0; j < xs.length; j++) {
              if (xs[j] === cat) catIndices.push(j);
            }
            (perCat[cat] || []).forEach(function(v, idx){
              xs2.push(cat);
              ys2.push(v);
              if (catIndices[idx] !== undefined) {
                patientIds2.push(patientIds[catIndices[idx]]);
              }
            });
          });
          xs = xs2; ys = ys2; patientIds = patientIds2;
        }

        // Préparer data Highcharts boxplot
        function quantile(arr, q){
          var a = arr.slice().sort(function(a,b){return a-b;});
          var pos = (a.length - 1) * q;
          var base = Math.floor(pos);
          var rest = pos - base;
          if (a[base+1] !== undefined) return a[base] + rest * (a[base+1]-a[base]);
          return a[base];
        }
        function fiveNum(arr){
          if (!arr || arr.length === 0) return [null,null,null,null,null];
          var lo = Math.min.apply(null, arr);
          var q1 = quantile(arr, 0.25);
          var med = quantile(arr, 0.5);
          var q3 = quantile(arr, 0.75);
          var hi = Math.max.apply(null, arr);
          return [lo, q1, med, q3, hi];
        }
        var seriesData = CATEGORY_ORDER.map(function(cat){ return fiveNum(perCat[cat]); });
        var counts = CATEGORY_ORDER.map(function(cat){ return (perCat[cat] || []).length; });
        
        // Points individuels pour jitter (déjà filtrés selon le range baseline)
        var scatterData = [];
        xs.forEach(function(cat, i){
          var idx = CATEGORY_ORDER.indexOf(cat);
          if (idx >= 0 && isFinite(ys[i])) {
            var pointData = {
              x: idx,
              y: ys[i]
            };
            scatterData.push(pointData);
          }
        });
        if (headerCounts === null) { headerCounts = counts.slice(); }
        
        // Calculer le nombre total de patients
        var totalPatients = scatterData.length;

        var mountId = 'hc_' + p.replace(/[^a-zA-Z0-9_]/g,'_');
        var vw = (typeof window !== 'undefined') ? window.innerWidth : 1024;
        var isMobile = vw <= 768;
        charts.push({
          'type': 'Div', 'namespace': 'dash_html_components',
          'props': { 'className': 'chart-card', 'style': { 'width': '100%', 'margin': '8px 0', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center' }, 'children': [
            { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'id': mountId, 'style': { 'height': isMobile ? '400px' : '450px', 'width': '100%', 'maxWidth': '800px' } } }
          ]}
        });

        // Monter Highcharts (imperatif) après le rendu
        setTimeout(function(){
          if (window.Highcharts) {
            // Détruire l'ancien graphique s'il existe pour éviter les listeners multiples
            var existingChart = window.Highcharts.charts ? window.Highcharts.charts.find(function(ch) {
              return ch && ch.renderTo && ch.renderTo.id === mountId;
            }) : null;
            if (existingChart && existingChart._resizeHandler) {
              if (typeof window !== 'undefined') {
                window.removeEventListener('resize', existingChart._resizeHandler);
              }
              existingChart.destroy();
            }
            
            var vw2 = (typeof window !== 'undefined') ? window.innerWidth : 1024;
            var isMobile2 = vw2 <= 768;
            var chart = window.Highcharts.chart(mountId, {
              chart: { 
                type: 'boxplot', 
                backgroundColor: 'white', 
                spacingLeft: 0, 
                spacingRight: 10,
                // Empêcher Highcharts d'intercepter le scroll vertical sur mobile
                panning: false,
                pinchType: '',
                zooming: { enabled: false },
                animation: { duration: 400 },
                inverted: !isMobile2
              },
              title: { text: 'Changes in ' + formatParameterName(p) + '     <span style="font-size: 0.85em; font-weight: bold; color: #666;"><br>  n=' + totalPatients + '</span>', useHTML: true, style: { fontSize: (isMobile2 ? '13px' : '15px'), fontFamily: '"VistaSans OT", "Vista Sans", Lato, Arial, sans-serif' } },
              plotOptions: {
                series: {
                  enableMouseTracking: true,
                  stickyTracking: false,
                  states: { hover: { enabled: true } },
                  animation: { duration: 400 },
                  cursor: 'pointer',
                  events: {
                    click: function (e) {
                      var c = this.chart;
                      var idx = null;
                      if (e && e.point && typeof e.point.x === 'number') {
                        idx = e.point.x;
                      } else if (c && c.xAxis && c.xAxis[0] && typeof e.chartX === 'number') {
                        var xAxis = c.xAxis[0];
                        var relX = e.chartX - c.plotLeft;
                        var val = xAxis.toValue ? xAxis.toValue(relX, true) : null;
                        if (val !== null && val !== undefined && isFinite(val)) idx = Math.round(val);
                      }
                      if (typeof idx === 'number' && c && typeof c.setActiveBand === 'function') {
                        c.setActiveBand(idx, (e && e.point) ? e.point : null);
                      }
                    }
                  },
                  point: {
                    events: {
                      click: function() {
                        var idx = (typeof this.x === 'number') ? this.x : this.index;
                        var c = this.series && this.series.chart;
                        if (c && typeof c.setActiveBand === 'function') {
                          c.setActiveBand(idx, this);
                        }
                      }
                    }
                  }
                },
                boxplot: {
                  enableMouseTracking: true,
                  animation: { duration: 400 }
                },
                scatter: {
                  enableMouseTracking: true,
                  animation: { duration: 300 }
                }
              },
              xAxis: { 
                categories: CATEGORY_LABELS, 
                title: { text: null },
                labels: { useHTML: true }
              },
              yAxis: { 
                title: { text: 'Changes (Post - Pre)' },
                plotLines: [{
                  value: 0,
                  color: '#888888',
                  dashStyle: 'dashed',
                  width: 2.5,
                  zIndex: 0
                }]
              },
              accessibility: { enabled: true },
              legend: { enabled: false },
              credits: { enabled: false },
              tooltip: { 
                enabled: true,
                followTouchMove: false,
                formatter: function(){
                  // Arrondi adaptatif: max 3 décimales selon l'ordre de grandeur
                  function fmt(v){
                    var av = Math.abs(v);
                    var dec = av >= 100 ? 0 : (av >= 10 ? 1 : (av >= 1 ? 2 : 3));
                    return Highcharts.numberFormat(v, dec);
                  }
                  // Récupérer l'indice de catégorie de manière robuste (boxplot OU scatter)
                  var idx = (typeof this.point.x === 'number') ? this.point.x : this.point.index;
                  if (idx === undefined || idx === null) idx = 0;
                  // Essayer de récupérer la médiane depuis le point boxplot correspondant
                  var bpSeries = (this.series && this.series.chart && this.series.chart.series && this.series.chart.series[0]) ? this.series.chart.series[0] : null;
                  var bpPoint = (bpSeries && bpSeries.points && bpSeries.points[idx]) ? bpSeries.points[idx] : null;
                  var medVal = (bpPoint && typeof bpPoint.median === 'number') ? bpPoint.median : ((typeof this.point.median === 'number') ? this.point.median : null);
                  var medStr = (medVal !== null && medVal !== undefined) ? fmt(medVal) : '—';
                  var n = (counts && counts[idx]) ? counts[idx] : 0;
                  return '<b>Median:</b> ' + medStr + '<br/><b>n:</b> ' + n;
                }
              },
              series: [
                {
                  name: 'Delta',
                  type: 'boxplot',
                  data: seriesData,
                  whiskerWidth: 0,
                  lineWidth: 1.5,
                  color: 'rgba(50,50,50,1)',
                  events: {
                    click: function(e){
                      var c = this.chart;
                      var idx = (e && e.point && typeof e.point.x === 'number') ? e.point.x : null;
                      if (typeof idx === 'number' && c && typeof c.setActiveBand === 'function') {
                        c.setActiveBand(idx, e.point);
                      }
                    }
                  }
                },
                {
                  name: 'Individuals',
                  type: 'scatter',
                  data: scatterData,
                  jitter: { x: 0.24, y: 0 },
                  marker: { 
                    radius: 3.5, 
                    lineWidth: 0.5
                  },
                  colorByPoint: false,
                  opacity: 0.45,
                  tooltip: { enabled: false },
                  enableMouseTracking: true,
                  states: { hover: { enabled: false }, inactive: { opacity: 1 } },
                  events: {
                    click: function(e){
                      var c = this.chart;
                      var idx = (e && e.point && typeof e.point.x === 'number') ? e.point.x : null;
                      if (typeof idx === 'number' && c && typeof c.setActiveBand === 'function') {
                        c.setActiveBand(idx, e.point);
                      }
                    }
                  },
                  showInLegend: false,
                  color: undefined
                }
              ]
            });

            // Cliquer une zone de catégorie OU un point: surligner et afficher le tooltip
            try {
              var xAxis0 = chart && chart.xAxis && chart.xAxis[0];
              if (xAxis0) {
                var catArr = CATEGORY_SHORT || [];
                chart.setActiveBand = function(idx, point){
                  try {
                    xAxis0.removePlotBand('active-band');
                  } catch(e) {}
                  xAxis0.addPlotBand({ id: 'active-band', from: idx - 0.5, to: idx + 0.5, color: 'rgba(0,0,0,0.08)', zIndex: 0 });
                  var pt = point || (chart.series[0] && chart.series[0].points ? chart.series[0].points[idx] : null);
                  if (!pt && chart.series[1] && chart.series[1].points) {
                    // fallback: premier scatter du bin
                    for (var k = 0; k < chart.series[1].points.length; k++) {
                      if (chart.series[1].points[k].x === idx) { pt = chart.series[1].points[k]; break; }
                    }
                  }
                  if (pt) { chart.tooltip.refresh(pt); }
                };
                for (var ii = 0; ii < catArr.length; ii++) {
                  (function(i){
                    xAxis0.addPlotBand({
                      id: 'click-band-' + i,
                      from: i - 0.5,
                      to: i + 0.5,
                      color: 'rgba(0,0,0,0)',
                      zIndex: 0,
                      events: { click: function(){ if (chart && chart.setActiveBand) chart.setActiveBand(i); } }
                    });
                  })(ii);
                }
              }
            } catch(e) { /* no-op */ }

            // Appliquer une règle CSS runtime pour favoriser le scroll vertical
            if (chart && chart.container) {
              try {
                chart.container.style.touchAction = 'pan-y';
                chart.container.style.webkitOverflowScrolling = 'touch';
              } catch (e) {}
            }
            
            // Gérer le redimensionnement de la fenêtre pour mettre à jour `inverted`
            var resizeTimeout = null;
            // Mémoriser l'état courant pour éviter des updates inutiles
            chart._lastIsMobile = isMobile2;
            var handleResize = function() {
              if (resizeTimeout) { clearTimeout(resizeTimeout); }
              resizeTimeout = setTimeout(function() {
                if (chart && !chart.destroyed) {
                  var newVw = (typeof window !== 'undefined') ? window.innerWidth : 1024;
                  var newIsMobile = newVw <= 768;
                  if (newIsMobile === chart._lastIsMobile) return; // rien à faire
                  chart._lastIsMobile = newIsMobile;
                  var shouldBeInverted = !newIsMobile;
                  if (chart.options.chart.inverted !== shouldBeInverted) {
                    (window.requestAnimationFrame || function(cb){return setTimeout(cb,0);})(function(){
                      chart.update({ chart: { inverted: shouldBeInverted } }, true);
                      if (chart && chart.redraw) { chart.redraw(); }
                    });
                  }
                }
              }, 300); // Debounce de 300ms
            };
            
            // Ajouter le listener de resize
            if (typeof window !== 'undefined') {
              window.addEventListener('resize', handleResize, { passive: true });
              // Stocker le handler pour pouvoir le supprimer plus tard si nécessaire
              if (chart) { chart._resizeHandler = handleResize; }
            }
          }
        }, 0);

        // Table data for this parameter: mean +/- CI95 by category
        // Calculer les statistiques pour chaque catégorie
        CATEGORY_ORDER.forEach(function(cat){
          var arr = perCat[cat];
          var baselineArr = baselinePerCat[cat];
          if (!tableRows[cat]) {
            tableRows[cat] = {};
          }
          
          // Calculer les stats de baseline (mean ± std)
          if (baselineArr && baselineArr.length > 0) {
            var baselineMean = baselineArr.reduce((a,b)=>a+b,0)/baselineArr.length;
            var baselineVariance = baselineArr.reduce((a,b)=>a + Math.pow(b-baselineMean,2),0) / (baselineArr.length - 1 || 1);
            var baselineStd = Math.sqrt(baselineVariance);
            tableRows[cat][p + '_baseline'] = baselineMean.toFixed(2) + ' ± ' + baselineStd.toFixed(2);
          } else {
            tableRows[cat][p + '_baseline'] = 'N/A';
          }
          
          // Calculer les stats de changement (mean [CI95])
          if (arr.length > 0) {
            var m = arr.reduce((a,b)=>a+b,0)/arr.length;
            var variance = arr.reduce((a,b)=>a + Math.pow(b-m,2),0) / (arr.length - 1 || 1);
            var sd = Math.sqrt(variance);
            var se = sd / Math.sqrt(arr.length);
            var low = m - 1.96*se; var up = m + 1.96*se;
            tableRows[cat][p] = m.toFixed(1) + ' [' + low.toFixed(1) + '; ' + up.toFixed(1) + ']';
          } else {
            tableRows[cat][p] = 'N/A';
          }
      });

      // DataTable Dash transposé : catégories en lignes, paramètre en colonne
      var firstColTitle = (grouping==='duration') ? 'days' : (grouping==='gender'?'Gender': grouping==='bmi'?'BMI categories':'Age categories');
      var columns = [{name: firstColTitle, id: 'Category'}].concat([
        {
          name: 'Baseline',
          id: 'Baseline',
          type: 'text'
        },
        {
          name: 'Change',
          id: 'Parameter',
          type: 'text'
        }
      ]);
      
      // Créer les lignes : une ligne par catégorie
      var dataRows = CATEGORY_ORDER.map(function(cat, idx){
        var nVal = headerCounts ? headerCounts[idx] : 0;
        var catLabel = CATEGORY_SHORT[idx] + '  (n=' + nVal + ')';
        var baselineValue = tableRows[cat] && tableRows[cat][p + '_baseline'] ? tableRows[cat][p + '_baseline'] : 'N/A';
        var changeValue = tableRows[cat] && tableRows[cat][p] ? tableRows[cat][p] : 'N/A';
        return {
          'Category': catLabel,
          'Baseline': baselineValue,
          'Parameter': changeValue
        };
      });
      var vw = (typeof window !== 'undefined') ? window.innerWidth : 1024;
      var isMobile = vw <= 768;
      var isWide = vw >= 1200;
      var baseFontSize = isMobile ? '12px' : (isWide ? '16px' : '14px');
      var catFontSize = isMobile ? '11px' : (isWide ? '14px' : '13px');
      var cellPadding = isMobile ? '6px 8px' : (isWide ? '10px 12px' : undefined);
      var table = {
        'type': 'DataTable', 'namespace': 'dash_table',
        'props': {
          'data': dataRows,
          'columns': columns,
          'merge_duplicate_headers': true,
          'page_action': 'native',
          'style_cell': { 
            'textAlign': 'center', 
            'fontFamily': 'Lato, sans-serif', 
            'fontSize': isMobile ? '11px' : '13px', 
            'whiteSpace': 'normal', 
            'wordBreak': 'break-word', 
            'padding': cellPadding || '10px 12px',
            'height': 'auto',
            'lineHeight': '1.25',
            'width': 'auto',
            'border': 'none',
          },
          'style_header': { 
            'backgroundColor': '#f3f6f8', 
            'fontWeight': '700',
            'border': 'none',
            'borderBottom': '2px solid #cfd6dc',
            'whiteSpace': 'normal',
            'fontSize': isMobile ? '12px' : '14px'
          },
          'style_data': { 'backgroundColor': 'white', 'border': 'none' },
          'style_data_conditional': [
            { 'if': { 'column_id': 'Category' }, 'fontWeight': '500' },
            { 'if': { 'column_id': 'Baseline' }, 'fontSize': catFontSize, 'textAlign': 'center' },
            { 'if': { 'column_id': 'Parameter' }, 'fontSize': catFontSize, 'textAlign': 'center' }
          ],
          'style_table': { 
            'margin': '12px 0', 
            'borderRadius': '4px',
            'overflowX': 'auto',
            'overflowY': 'hidden',
            'width': '100%',
            'maxWidth': '100%',
          },

        }
      };

      var info = { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'children': [] }};

      var chartsWrap = { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'style': { 'display': 'flex', 'flexWrap': 'wrap', 'justifyContent': 'center' }, 'children': charts }};
      var tableWrap = { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'children': [
        { 'type': 'H4', 'namespace': 'dash_html_components', 'props': { 'children': 'Mean Change [Confidence Interval 95%]', 'style': {'marginTop': '30px'} } },
        table
      ]}};

      return [info, chartsWrap, tableWrap];
    },
    updateCohortStats: function(data, age_cat, bmi_cat, sex, varA, varB, parameter, baselineRange) {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'children': 'No data available' } };
      }

      // Filtrer les données selon les critères démographiques
      var filtered = data.filter(function(r) {
        var ok = true;
        if (age_cat) ok = ok && r.age_cat === age_cat;
        if (bmi_cat) ok = ok && r.BMI_cat === bmi_cat;
        if (sex) ok = ok && r.sex === sex;
        return ok;
      });

      if (filtered.length === 0) {
        return { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'children': 'No data matching the selected filters' } };
      }

      // Extraire le range baseline pour le filtrage
      var baselineMin = (baselineRange && Array.isArray(baselineRange) && baselineRange.length >= 2) ? Number(baselineRange[0]) : null;
      var baselineMax = (baselineRange && Array.isArray(baselineRange) && baselineRange.length >= 2) ? Number(baselineRange[1]) : null;

      // Si un paramètre et un range baseline sont définis, identifier les patients valides
      var validPatientIds = null;
      if (parameter && baselineMin !== null && baselineMax !== null && isFinite(baselineMin) && isFinite(baselineMax)) {
        validPatientIds = new Set();
        filtered.forEach(function(r) {
          if (r.timepoint === 'Pre' && r[parameter] !== null && r[parameter] !== undefined && r[parameter] !== '') {
            var baselineValue = Number(r[parameter]);
            if (isFinite(baselineValue) && baselineValue >= baselineMin && baselineValue <= baselineMax) {
              validPatientIds.add(r.meta_id);
            }
          }
        });
      }

      // Extraire les données uniques par meta_id (un patient = un meta_id)
      var uniquePatients = {};
      filtered.forEach(function(r) {
        var id = r.meta_id;
        
        // Si on a un filtre baseline, vérifier que le patient est valide
        if (validPatientIds !== null && !validPatientIds.has(id)) {
          return; // Exclure ce patient
        }
        
        if (!uniquePatients[id]) {
          uniquePatients[id] = {
            age: r.age,
            age_cat: r.age_cat,
            sex: r.sex,
            BMI: r.BMI,
            BMI_cat: r.BMI_cat,
            length_of_fasting_cat: r.length_of_fasting_cat
          };
        }
      });

      var patients = Object.values(uniquePatients);
      var totalPatients = patients.length;

      // Catégories pour le Sankey
      var ageCategories = ['Young adults (18-34 years)', 'Middle age (35-64 years)', 'Older adults (≥65 years)'];
      var bmiCategories = ['Normal (18–24.9 kg/m²)', 'Overweight (25.0–29.9 kg/m²)', 'Obesity (≥30 kg/m²)'];
      var sexCategories = ['Male', 'Female'];
      var fastingCategories = ['3-7 days', '8-12 days', '13-17 days', '18+ days'];

      // Compter par catégorie d'âge
      var ageCounts = {};
      ageCategories.forEach(function(cat) { ageCounts[cat] = 0; });
      patients.forEach(function(p) {
        if (p.age_cat && ageCounts.hasOwnProperty(p.age_cat)) {
          ageCounts[p.age_cat]++;
        }
      });

      // Compter par catégorie de BMI
      var bmiCounts = {};
      bmiCategories.forEach(function(cat) { bmiCounts[cat] = 0; });
      patients.forEach(function(p) {
        if (p.BMI_cat && bmiCounts.hasOwnProperty(p.BMI_cat)) {
          bmiCounts[p.BMI_cat]++;
        }
      });

      // Pie chart pour le sexe
      var sexCounts = { M: 0, F: 0 };
      patients.forEach(function(p) {
        if (p.sex === 'M') sexCounts.M++;
        else if (p.sex === 'F') sexCounts.F++;
      });

      var vw = (typeof window !== 'undefined') ? window.innerWidth : 1024;
      var isMobile = vw <= 768;
       
      // Créer un seul conteneur pour le diagramme Sankey
      var sankeyMountId = 'hc_cohort_sankey';
      var sankeyChartDiv = {
        'type': 'Div',
        'namespace': 'dash_html_components',
        'props': {
          'className': 'chart-card',
          'style': { 'width': '100%', 'margin': '10px 0', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center' },
          'children': [
            { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'id': sankeyMountId, 'style': { 'height': isMobile ? '500px' : '600px', 'width': '100%', 'maxWidth': '800px', 'maxHeight':isMobile ? '500px' : '300px'} } }
          ]
        }
      };
      
      var chartsContainer = {
        'type': 'Div',
        'namespace': 'dash_html_components',
        'props': {
          'style': { 'display': 'flex', 'flexWrap': 'wrap', 'justifyContent': 'center', 'marginTop': '15px' },
          'children': [sankeyChartDiv]
        }
      };

      // Construire le diagramme Sankey
      // Structure: Age -> BMI -> Gender -> Fasting Duration
      setTimeout(function() {
        if (!window.Highcharts) {
          console.error('Highcharts not loaded');
          return;
        }
        if (!window.Highcharts.seriesTypes || !window.Highcharts.seriesTypes.sankey) {
          console.error('Sankey module not loaded. Make sure sankey.js is included.');
          return;
        }
        
        if (window.Highcharts && window.Highcharts.seriesTypes && window.Highcharts.seriesTypes.sankey) {
          var vw2 = (typeof window !== 'undefined') ? window.innerWidth : 1024;
          var isMobile2 = vw2 <= 768;
          
          if (totalPatients === 0) {
            return;
          }
          
          // Créer les nœuds pour le Sankey avec couleurs et ordre vertical
          // Dans Highcharts Sankey, l'ordre dans le tableau détermine la position verticale (bas vers haut)
          var nodes = [];
          var nodeIndex = {};
          
          // Mapping des catégories avec labels et couleurs
          // Age: Young (bas) → Middle → Older (haut)
          var ageConfig = [
            { cat: 'Young adults (18-34 years)', short: '18-34', name: 'Young adults', color: '#4a90e2' },
            { cat: 'Middle age (35-64 years)', short: '35-64', name: 'Middle Age', color: '#50e3c2' },
            { cat: 'Older adults (≥65 years)', short: '≥65', name: 'Older Adults', color: '#f5a623' }
          ];
          
          // BMI: Normal (bas) → Overweight → Obesity (haut)
          var bmiConfig = [
            { cat: 'Normal (18–24.9 kg/m²)', short: 'Normal', name: 'Normal', color: '#50e3c2' },
            { cat: 'Overweight (25.0–29.9 kg/m²)', short: 'Overweight', name: 'Overweight', color: '#f5a623' },
            { cat: 'Obesity (≥30 kg/m²)', short: 'Obesity', name: 'Obesity', color: '#d0021b' }
          ];
          
          // Gender: Male (bas) → Female (haut)
          var genderConfig = [
            { sex: 'M', name: 'Male', color: '#4a90e2' },
            { sex: 'F', name: 'Female', color: '#f45b69' }
          ];
          
          // Fasting: 3-7 (bas) → 8-12 → 13-17 → 18+ (haut)
          var fastingConfig = [
            { cat: '3-7 days', name: '3-7 days', color: '#4a90e2' },
            { cat: '8-12 days', name: '8-12 days', color: '#50e3c2' },
            { cat: '13-17 days', name: '13-17 days', color: '#f5a623' },
            { cat: '18+ days', name: '18+ days', color: '#d0021b' }
          ];
          
          // Colonne 1: Age (ordre: Young en bas → Older en haut)
          // offset: 0 = bas, plus élevé = plus haut
          ageConfig.forEach(function(config, idx) {
            var nodeId = 'Age_' + config.short;
            nodeIndex[nodeId] = nodes.length;
            nodes.push({ 
              id: nodeId, 
              name: config.name, 
              column: 0, 
              color: config.color,
              originalShort: config.short 
            });
      });
          
          // Colonne 2: BMI (ordre: Normal en bas → Obesity en haut)
          bmiConfig.forEach(function(config, idx) {
            var nodeId = 'BMI_' + config.short;
            nodeIndex[nodeId] = nodes.length;
            nodes.push({ 
              id: nodeId, 
              name: config.name, 
              column: 1, 
              color: config.color,
              originalShort: config.short 
            });
          });
          
          // Colonne 3: Gender (ordre: Male en bas → Female en haut)
          genderConfig.forEach(function(config, idx) {
            var nodeId = 'Gender_' + config.name;
            nodeIndex[nodeId] = nodes.length;
            nodes.push({ 
              id: nodeId, 
              name: config.name, 
              column: 2, 
              color: config.color,
              originalSex: config.sex 
            });
          });
          
          // Colonne 4: Fasting Duration (ordre: 3-7 en bas → 18+ en haut)
          fastingConfig.forEach(function(config, idx) {
            var nodeId = 'Fasting_' + config.cat;
            nodeIndex[nodeId] = nodes.length;
            nodes.push({ id: nodeId, name: config.name, column: 3, color: config.color, originalCat: config.cat });
          });

          // Si deux variables sélectionnées (varA, varB) sont fournies, ne garder que 2 colonnes
          var selVarA = (typeof varA === 'string' && varA) ? varA : 'gender';
          var selVarB = (typeof varB === 'string' && varB) ? varB : 'fasting';
          
          // Vérifier que les deux variables sont différentes
          if (selVarA === selVarB) {
            var existingChart = window.Highcharts.charts ? window.Highcharts.charts.find(function(ch) {
              return ch && ch.renderTo && ch.renderTo.id === sankeyMountId;
            }) : null;
            if (existingChart) {
              existingChart.destroy();
            }
            var errorDiv = document.getElementById(sankeyMountId);
            if (errorDiv) {
              errorDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #d0021b; font-family: \"VistaSans OT\", \"Vista Sans\", Lato, Arial, sans-serif; font-size: 16px;">Veuillez sélectionner deux variables différentes pour afficher le diagramme Sankey.</div>';
            }
            return;
          }
          
          if (selVarA && selVarB) {
            nodes = []; nodeIndex = {};
            function pushNodes(which, col){
              if (which === 'age') ageConfig.forEach(function(cfg){ var id='Age_'+cfg.short; nodeIndex[id]=nodes.length; nodes.push({id:id,name:cfg.name,column:col,color:cfg.color}); });
              else if (which === 'bmi') bmiConfig.forEach(function(cfg){ var id='BMI_'+cfg.short; nodeIndex[id]=nodes.length; nodes.push({id:id,name:cfg.name,column:col,color:cfg.color}); });
              else if (which === 'gender') genderConfig.forEach(function(cfg){ var id='Gender_'+cfg.name; nodeIndex[id]=nodes.length; nodes.push({id:id,name:cfg.name,column:col,color:cfg.color}); });
              else fastingConfig.forEach(function(cfg){ var id='Fasting_'+cfg.cat; nodeIndex[id]=nodes.length; nodes.push({id:id,name:cfg.name,column:col,color:cfg.color}); });
            }
            pushNodes(selVarA, 0);
            pushNodes(selVarB, 1);
          }

          // Calculer les flux (liens) directement avec les IDs des nœuds pour varA -> varB
          var links = [];
          function getAgeShort(cat){ if (!cat) return null; if (cat.indexOf('Young')>=0) return '18-34'; if (cat.indexOf('Middle')>=0) return '35-64'; if (cat.indexOf('Older')>=0) return '≥65'; return null; }
          function getBmiShort(cat){ if (!cat) return null; if (cat.indexOf('Normal')>=0) return 'Normal'; if (cat.indexOf('Overweight')>=0) return 'Overweight'; if (cat.indexOf('Obesity')>=0) return 'Obesity'; return null; }
          function keyFor(which,row){
            if (which==='age') { var a=getAgeShort(row.age_cat); return a?('Age_'+a):null; }
            if (which==='bmi') { var b=getBmiShort(row.BMI_cat); return b?('BMI_'+b):null; }
            if (which==='gender') { return row.sex==='M'?'Gender_Male':(row.sex==='F'?'Gender_Female':null); }
            return row.length_of_fasting_cat ? ('Fasting_'+row.length_of_fasting_cat) : null;
          }
          var map = {};
          patients.forEach(function(p){ var from=keyFor(selVarA,p); var to=keyFor(selVarB,p); if(!from||!to) return; var k=from+'|'+to; if(!map[k]) map[k]={from:from,to:to,weight:0}; map[k].weight++; });
          Object.keys(map).forEach(function(k){ links.push(map[k]); });
          
          // Calculer les comptes par nœud pour les pourcentages
          var nodeCounts = {};
          patients.forEach(function(p) {
            var a = getAgeShort(p.age_cat);
            if (a) {
              var nodeId = 'Age_' + a;
              nodeCounts[nodeId] = (nodeCounts[nodeId] || 0) + 1;
            }
            var b = getBmiShort(p.BMI_cat);
            if (b) {
              var nodeId = 'BMI_' + b;
              nodeCounts[nodeId] = (nodeCounts[nodeId] || 0) + 1;
            }
            var g = (p.sex === 'M' ? 'Male' : (p.sex === 'F' ? 'Female' : null));
            if (g) {
              var nodeId = 'Gender_' + g;
              nodeCounts[nodeId] = (nodeCounts[nodeId] || 0) + 1;
            }
            if (p.length_of_fasting_cat) {
              var nodeId = 'Fasting_' + p.length_of_fasting_cat;
              nodeCounts[nodeId] = (nodeCounts[nodeId] || 0) + 1;
            }
          });
          
          // Calculer les pourcentages par nœud
          var nodePercentages = {};
          Object.keys(nodeCounts).forEach(function(nodeId) {
            nodePercentages[nodeId] = totalPatients > 0 ? (nodeCounts[nodeId] / totalPatients * 100) : 0;
          });
          
          // Calculer les comptes par nœud source pour les pourcentages des liens
          var sourceNodeCounts = {};
          links.forEach(function(link) {
            sourceNodeCounts[link.from] = (sourceNodeCounts[link.from] || 0) + link.weight;
          });
          
          // Convertir les liens en format Highcharts avec les couleurs et % par source
          var sankeyData = links.map(function(link) {
            // Trouver la couleur du nœud source
            var sourceNode = nodes.find(function(n) { return n.id === link.from; });
            var sourceColor = sourceNode ? sourceNode.color : '#cccccc';
            var totalFrom = sourceNodeCounts[link.from] || 0;
            var linkPercent = totalFrom > 0 ? (link.weight / totalFrom * 100) : 0;

            // Retourner avec la couleur du nœud source et le % du flux relatif à la source
            return {
              from: link.from,
              to: link.to,
              weight: link.weight,
              color: sourceColor,
              linkPercent: linkPercent
            };
          });
          
          // Debug: afficher les données dans la console
          console.log('Sankey nodes:', nodes);
          console.log('Sankey data:', sankeyData);
          
          // Détruire l'ancien graphique s'il existe
          var existingChart = window.Highcharts.charts ? window.Highcharts.charts.find(function(ch) {
            return ch && ch.renderTo && ch.renderTo.id === sankeyMountId;
          }) : null;
          if (existingChart) {
            // Nettoyer le listener de resize si il existe
            if (existingChart._resizeHandler) {
              if (typeof window !== 'undefined') {
                window.removeEventListener('resize', existingChart._resizeHandler);
              }
            }
            // Nettoyer le listener de maxHeight si il existe
            if (existingChart._maxHeightHandler) {
              if (typeof window !== 'undefined') {
                window.removeEventListener('resize', existingChart._maxHeightHandler);
              }
            }
            existingChart.destroy();
          }
          
          // Créer le graphique Sankey
          var sankeyChart = window.Highcharts.chart(sankeyMountId, {
            sankeyVars: { a: selVarA, b: selVarB },
            chart: {
              type: 'sankey',
              backgroundColor: 'white',
              spacingLeft: 10,
              spacingRight: 10,
              panning: false,
              pinchType: '',
              zooming: { enabled: false },
              inverted: vw2 > 768,
              style: { fontFamily: '"VistaSans OT", "Vista Sans", Lato, Arial, sans-serif' },
            },
            title: { text: '', style: { fontSize: '16px', fontFamily: '"VistaSans OT", "Vista Sans", Lato, Arial, sans-serif' } },
            credits: { enabled: false },
            plotOptions: {
              sankey: {
                enableMouseTracking: true,
                animation: true,
                cursor: 'pointer',
                linkColorMode: 'from',
                states: {
                  hover: {
                    linkOpacity: 0.7,
                    brightness: 0.1
                  },
                  inactive: {
                    linkOpacity: 0.2
                  }
                },
                dataLabels: {
                  enabled: true,
                  useHTML: true,
                  formatter: function() {
                    if (this.point && this.point.node) {
                      var nodeId = this.point.node.id;
                      var nodePercent = nodePercentages[nodeId] || 0;
                      return '<div style="text-align: center; font-size: ' + (isMobile2 ? '13px' : '16px') + '; font-weight: 600; color: #111111; font-family: \"VistaSans OT\", \"Vista Sans\", Lato, Arial, sans-serif;\"><div>' + this.point.node.name + '</div><div style=\"font-size: 0.85em; color: #666; margin-top: 2px;\">' + nodePercent.toFixed(1) + '%</div></div>';
                    }
                    return '';
                  },
                  allowOverlap: true,
                  style: {
                    textOutline: 'none',
                    cursor: 'pointer',
                    fontFamily: '"VistaSans OT", "Vista Sans", Lato, Arial, sans-serif',
                    color: '#111111',
                    pointerEvents: 'none'
                  }
                },
                nodeWidth: 25,
                nodePadding: 15,
                minLinkWidth: 3,
                linkOpacity: 0.5
              }
            },
            tooltip: {
              enabled: true,
              useHTML: true,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderWidth: 1,
              borderRadius: 4,
              shadow: true,
              style: { zIndex: 9999, pointerEvents: 'none', fontFamily: '"VistaSans OT", "Vista Sans", Lato, Arial, sans-serif' },
              formatter: function() {
                var p = this.point || {};
                // Tooltip pour les liens (ponts)
                if (p.fromNode && p.toNode) {
                  var linkPercent = (typeof p.linkPercent === 'number') ? p.linkPercent : 0;
                  return '<div style="padding: 5px;"><b style="color: ' + p.fromNode.color + ';">' + p.fromNode.name + '</b> → <b style="color: ' + p.toNode.color + ';">' + p.toNode.name + '</b><br/>' +
                         '<span style="font-size: 15px; font-weight: bold;">Patients: ' + p.weight + '</span><br/>' +
                         '<span style="font-size: 14px; color: #666;">' + linkPercent.toFixed(1) + '%</span></div>';
                }
                // Tooltip pour les nœuds
                if (p.isNode) {
                  var nid = p.id;
                  if (!nid) {
                    var match = (nodes || []).find(function(n){ return n.name === p.name; });
                    nid = match ? match.id : undefined;
                  }
                  var percent = nid && nodePercentages[nid] ? nodePercentages[nid] : 0;
                  var total = (typeof p.sum === 'number') ? p.sum : (nid && nodeCounts[nid] ? nodeCounts[nid] : 0);
                  var color = p.color || '#333';
                  return '<div style="padding: 5px;"><b style="color: ' + color + ';">' + (p.name || '') + '</b><br/>' +
                         '<span style="font-size: 15px;">Total: ' + total + ' patients</span><br/>' +
                         '<span style="font-size: 14px; color: #666;">' + percent.toFixed(1) + '%</span></div>';
                }
                return '';
              }
            },
            series: [{
              type: 'sankey',
              name: 'Patient Flow',
              keys: ['from', 'to', 'weight', 'color'],
              data: sankeyData,
              nodes: nodes.map(function(n) {
                return {
                  id: n.id,
                  name: n.name,
                  column: n.column,
                  color: n.color
                };
              }),
              linkColorMode: 'from',
              colorByPoint: false
            }]
          });
          
          // Gérer le redimensionnement de la fenêtre pour mettre à jour `inverted` du Sankey
          var sankeyResizeTimeout = null;
          sankeyChart._lastIsWide = (vw2 > 760);
          var handleSankeyResize = function() {
            if (sankeyResizeTimeout) { clearTimeout(sankeyResizeTimeout); }
            sankeyResizeTimeout = setTimeout(function() {
              if (sankeyChart && !sankeyChart.destroyed) {
                var newVw = (typeof window !== 'undefined') ? window.innerWidth : 1024;
                var shouldBeInverted = newVw > 760;
                if (shouldBeInverted === sankeyChart._lastIsWide) return;
                sankeyChart._lastIsWide = shouldBeInverted;
                if (sankeyChart.options.chart.inverted !== shouldBeInverted) {
                  (window.requestAnimationFrame || function(cb){return setTimeout(cb,0);})(function(){
                    sankeyChart.update({ chart: { inverted: shouldBeInverted } }, true);
                    if (sankeyChart && sankeyChart.redraw) { sankeyChart.redraw(); }
                  });
                }
              }
            }, 50); // Debounce de 300ms
          };
          
          // Ajouter le listener de resize
          if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleSankeyResize, { passive: true });
            // Stocker le handler pour pouvoir le supprimer plus tard si nécessaire
            if (sankeyChart) { sankeyChart._resizeHandler = handleSankeyResize; }
          }
          
          var sankeyEl = document.getElementById(sankeyMountId);
          if (sankeyEl) {
            // Permettre l'interactivité tactile tout en gardant le scroll vertical
            sankeyEl.style.touchAction = 'pan-y pinch-zoom';
            
            // Gérer le redimensionnement pour mettre à jour maxHeight dynamiquement
            var updateSankeyMaxHeight = function() {
              if (sankeyEl) {
                var newVw = (typeof window !== 'undefined') ? window.innerWidth : 1024;
                var newIsMobile = newVw <= 768;
                var newMaxHeight = newIsMobile ? '500px' : '300px';
                if (sankeyEl.style.maxHeight !== newMaxHeight) {
                  sankeyEl.style.maxHeight = newMaxHeight;
                }
              }
            };
            
            // Ajouter le listener de resize
            if (typeof window !== 'undefined') {
              window.addEventListener('resize', updateSankeyMaxHeight, { passive: true });
              // Stocker le handler pour cleanup lors de la destruction
              if (sankeyChart) { sankeyChart._resizeMaxHeightHandler = updateSankeyMaxHeight; }
            }
          }

          // Cleanup listeners si on recrée/détruit ce graphique
          if (existingChart) {
            try {
              if (existingChart._resizeHandler && typeof window !== 'undefined') {
                window.removeEventListener('resize', existingChart._resizeHandler);
              }
              if (existingChart._resizeMaxHeightHandler && typeof window !== 'undefined') {
                window.removeEventListener('resize', existingChart._resizeMaxHeightHandler);
              }
            } catch(e) {}
          }
        }
      }, 100);

      return chartsContainer;
    },
    toggleReadMore: function(n_clicks) {
      var opened = ((n_clicks || 0) % 2) === 1;

      var el = document.getElementById('aboutShowMore');
      if (el) {
        if (opened) {
          // Dépliement: laisser la transition CSS agir
          el.style.transition = '';
          el.style.maxHeight = el.scrollHeight + 'px';
        } else {
          // Repliement: aucune animation (transition désactivée)
          el.style.transition = 'none';
          el.style.maxHeight = '40px';
          // Réactiver la transition pour les prochains dépliements
          setTimeout(function(){ el.style.transition = ''; }, 0);
        }
      }

      var content_style = opened
        ? { maxHeight: '600px', textAlign: 'justify', opacity: 1 }
        : { maxHeight: '40px',  textAlign: 'justify', opacity: 1 };

      var gradient_style = { opacity: opened ? 0 : 1 };
      var bar_style = window.dash_clientside && window.dash_clientside.no_update ? window.dash_clientside.no_update : null;

      var button_class = opened ? 'readmore-btn opened' : 'readmore-btn';
      var button_text = opened ? 'Read less' : 'Read more';

      return [content_style, button_class, gradient_style, bar_style, button_text];
    }
  }
});


