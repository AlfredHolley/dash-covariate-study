// Client-side callbacks for Dash
// This file is automatically served by Dash from the assets/ directory

window.dash_clientside = Object.assign({}, window.dash_clientside, {
  ui: {
    switchCohortTab: function(t1, t2, t3, t4, t5, current) {
      // Utiliser les timestamps pour choisir le dernier bouton cliqué
      var ts = [t1||0, t2||0, t3||0, t4||0, t5||0];
      var max = Math.max.apply(null, ts);
      if (!max || max <= 0) return current || 'Cohort';
      var idx = ts.indexOf(max);
      return ['Cohort','Fasting duration','Gender','Age','BMI'][idx];
    },
    updateCohortTabClasses: function(active) {
      var base = 'cohort-tab-btn';
      var keys = ['Cohort','Fasting duration','Gender','Age','BMI'];
      return keys.map(function(k){ return k === (active||'Cohort') ? base + ' selected' : base; });
    },
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
    updateAnalysis: function(data, groupingTab, age_cat, bmi_cat, sex, category) {
      if (!data || !category) {
        return [
          { 'props': { 'children': [{'props': {'children': 'Select a category to start the analysis', 'style': {'color': '#6c757d', 'marginBottom': '20px', 'textAlign': 'center'}}, 'type': 'H4', 'namespace': 'dash_html_components'}] }, 'type': 'Div', 'namespace': 'dash_html_components' },
          '',
          ''
        ];
      }

      var CATEGORIES = {
        'Hepatic health': ['ALP [U/L]', 'GGT [U/L]', 'GOT AST [U/L]', 'GPT ALT [U/L]'],
        'Lipid & Heart profile': ['LDL [mg/dL]', 'TC [mg/dL]', 'HDL [mg/dL]', 'SBP [mmHg]', 'DBP [mmHg]'],
        'Glucose control': ['glucose [mg/dL]', 'HBA1C [%]'],
        'Body composition': ['BMI [kg/m²]', 'weight [kg]', 'WC [cm]']
      };
      // Grouping config
      var grouping = (groupingTab || 'duration');
      var xField, CATEGORY_ORDER, CATEGORY_SHORT, DISPLAY_MAP;
      var CAT_COLORS;
      if (grouping === 'gender') {
        xField = 'sex'; CATEGORY_ORDER = ['M','F']; CATEGORY_SHORT = ['Male','Female']; DISPLAY_MAP = {'M':'Male','F':'Female'}; CAT_COLORS = ['#4a90e2','#f45b69'];
      } else if (grouping === 'bmi') {
        xField = 'BMI_cat'; CATEGORY_ORDER = ['Normal (18–24.9 kg/m²)','Overweight (25.0–29.9 kg/m²)','Obesity (≥30 kg/m²)']; CATEGORY_SHORT = CATEGORY_ORDER.slice(); CAT_COLORS = ['#50e3c2','#f5a623','#d0021b'];
      } else if (grouping === 'age') {
        xField = 'age_cat'; CATEGORY_ORDER = ['Young adults (18-34 years)','Middle age (35-64 years)','Older adults (≥65 years)']; CATEGORY_SHORT = ['18-34','35-64','≥65']; CAT_COLORS = ['#7ed321','#4a90e2','#bd10e0'];
      } else {
        xField = 'length_of_fasting_cat'; CATEGORY_ORDER = ['3-7 days', '8-12 days', '13-17 days', '18+ days']; CATEGORY_SHORT = ['3-7','8-12','13-17','18+']; CAT_COLORS = ['#4a90e2','#50e3c2','#f5a623','#d0021b'];
      }

      var params = CATEGORIES[category] || [];
      if (!params.length) {
        return ['No parameters for this category', '', ''];
      }

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

      // Construire deltas par paramètre
      var charts = [];
      var totalIds = new Set();
      var tableRows = {};
      var headerCounts = null;
      params.forEach(function(p){
        var xs = []; var ys = [];
        var perCat = {}; CATEGORY_ORDER.forEach(function(c){ perCat[c] = []; });
        Object.keys(byId).forEach(function(id){
          var rec = byId[id];
          var catKey = rec.meta[xField];
          if (rec.pre[p] !== undefined && rec.post[p] !== undefined && catKey) {
            var delta = rec.post[p] - rec.pre[p];
            var cat = catKey;
            if (CATEGORY_ORDER.indexOf(cat) !== -1 && isFinite(delta)) {
              xs.push(cat); ys.push(delta);
              perCat[cat].push(delta);
              totalIds.add(id);
            }
          }
        });

        // Filtrer les outliers (z-score > 4) pour GPT, GOT et GGT
        var OUTLIER_PARAMS = { 'GOT AST [U/L]': true, 'GPT ALT [U/L]': true, 'GGT [U/L]': true };
        if (OUTLIER_PARAMS[p]) {
          var xs2 = []; var ys2 = [];
          CATEGORY_ORDER.forEach(function(cat){
            var arr = perCat[cat];
            if (arr.length > 1) {
              var m = arr.reduce((a,b)=>a+b,0) / arr.length;
              var variance = arr.reduce((a,b)=>a + Math.pow(b-m,2),0) / (arr.length - 1);
              var sd = Math.sqrt(Math.max(variance, 0));
              var filtered = (sd > 0) ? arr.filter(function(v){ return Math.abs((v - m)/sd) <= 3.5; }) : arr;
              perCat[cat] = filtered;
            }
            // reconstruire xs/ys depuis perCat
            (perCat[cat] || []).forEach(function(v){ xs2.push(cat); ys2.push(v); });
          });
          xs = xs2; ys = ys2;
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
        // Points individuels pour jitter
        var scatterData = [];
        xs.forEach(function(cat, i){
          var idx = CATEGORY_ORDER.indexOf(cat);
          if (idx >= 0 && isFinite(ys[i])) scatterData.push({ x: idx, y: ys[i], color: CAT_COLORS[idx] });
        });
        if (headerCounts === null) { headerCounts = counts.slice(); }

        var mountId = 'hc_' + p.replace(/[^a-zA-Z0-9_]/g,'_');
        var vw = (typeof window !== 'undefined') ? window.innerWidth : 1024;
        var isMobile = vw <= 768;
        charts.push({
          'type': 'Div', 'namespace': 'dash_html_components',
          'props': { 'className': 'chart-card', 'style': isMobile ? { 'width': '100%', 'display': 'block', 'margin': '8px 0' } : { 'width': '48%', 'display': 'inline-block', 'margin': '1%' }, 'children': [
            { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'id': mountId, 'style': { 'height': isMobile ? '260px' : '300px' } } }
          ]}
        });

        // Monter Highcharts (imperatif) après le rendu
        setTimeout(function(){
          if (window.Highcharts) {
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
                zooming: { enabled: false }
              },
              plotOptions: {
                series: {
                  enableMouseTracking: !isMobile2 ? true : false,
                  stickyTracking: false,
                  states: { hover: { enabled: true } },
                  animation: false
                },
                boxplot: {
                  enableMouseTracking: !isMobile2 ? true : false
                },
                scatter: {
                  enableMouseTracking: false
                }
              },
              title: { text: p, style: { fontSize: '14px' } },
              xAxis: { categories: CATEGORY_SHORT, title: { text: null } },
              yAxis: { title: { text: null } },
              accessibility: { enabled: true },
              legend: { enabled: false },
              credits: { enabled: false },
              tooltip: { 
                enabled: !isMobile2,
                followTouchMove: false,
                formatter: function(){
                  // Arrondi adaptatif: max 3 décimales selon l'ordre de grandeur
                  function fmt(v){
                    var av = Math.abs(v);
                    var dec = av >= 100 ? 0 : (av >= 10 ? 1 : (av >= 1 ? 2 : 3));
                    return Highcharts.numberFormat(v, dec);
                  }
                  var idx = this.point.index;
                  var n = counts[idx] || 0;
                  var med = (typeof this.point.median === 'number') ? fmt(this.point.median) : this.point.median;
                  return '<b>Median:</b> ' + med + '<br/><b>n:</b> ' + n;
                }
              },
              series: [
                {
                  name: 'Delta',
                  type: 'boxplot',
                  data: seriesData,
                  whiskerWidth: 0,
                  lineWidth: 1.5,
                  color: 'rgba(50,50,50,1)'
                },
                {
                  name: 'Individuals',
                  type: 'scatter',
                  data: scatterData,
                  jitter: { x: 0.24, y: 0 },
                  marker: { radius: 3.5, lineWidth: 0.5 },
                  opacity: 0.45,
                  tooltip: { enabled: false },
                  enableMouseTracking: false,
                  states: { hover: { enabled: false }, inactive: { opacity: 1 } },
                  showInLegend: false,
                  color: undefined
                }
              ]
            });

            // Appliquer une règle CSS runtime pour favoriser le scroll vertical
            if (chart && chart.container) {
              try {
                chart.container.style.touchAction = 'pan-y';
                chart.container.style.webkitOverflowScrolling = 'touch';
              } catch (e) {}
            }
          }
        }, 0);

        // Table data for this parameter: mean +/- CI95 by category
        var row = { 'Parameter': p };
        CATEGORY_ORDER.forEach(function(cat){
          var arr = perCat[cat];
          if (arr.length > 0) {
            var m = arr.reduce((a,b)=>a+b,0)/arr.length;
            var variance = arr.reduce((a,b)=>a + Math.pow(b-m,2),0) / (arr.length - 1 || 1);
            var sd = Math.sqrt(variance);
            var se = sd / Math.sqrt(arr.length);
            var low = m - 1.96*se; var up = m + 1.96*se;
            row[cat] = m.toFixed(1) + ' [' + low.toFixed(1) + '; ' + up.toFixed(1) + ']';
          } else {
            row[cat] = 'N/A';
          }
        });
        tableRows[p] = row;
      });

      // DataTable Dash (retour)
      // Remarque: Dans dash_table.DataTable, '\n' ou '<br>' dans le header ne fonctionnent pas (voir doc).
      // La seule astuce possible côté client est d'utiliser un espace insécable (unicode: \u00A0) ou d'ajouter un style CSS, 
      // ou de séparer visuellement le texte avec un séparateur, ex: '•'.
      var firstColTitle = (grouping==='duration') ? 'days' : (grouping==='gender'?'Gender': grouping==='bmi'?'BMI categories':'Age categories');
      var columns = [{name: firstColTitle, id: 'Parameter'}].concat(CATEGORY_ORDER.map(function(c, idx){
        var nVal = headerCounts ? headerCounts[idx] : 0;
        // Utilisation d'un séparateur " • " pour séparer les lignes dans le header (car ni \n ni <br> ne sont supportés)
        return { name: CATEGORY_SHORT[idx] + '  (n=' + nVal + ')', id: c };
      }));
      var dataRows = Object.values(tableRows);
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
          'page_size': 10,
          'style_cell': { 
            'textAlign': 'left', 
            'fontFamily': 'Lato, sans-serif', 
            'fontSize': isMobile ? '11px' : '13px', 
            'whiteSpace': 'normal', 
            'wordBreak': 'break-word', 
            'padding': cellPadding || '10px 12px',
            'height': 'auto',
            'lineHeight': '1.25',
            'minWidth': isMobile ? '40px' : '110px',
            'maxWidth': isMobile ? '130px' : '260px',
            'width': 'auto',
            'border': 'none',
            'borderBottom': '1px solid #e6e6e6'
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
            { 'if': { 'column_id': 'Parameter' }, 'fontWeight': '500' }
          ].concat(CATEGORY_ORDER.map(function(cat){ return { 'if': { 'column_id': cat }, 'fontSize': catFontSize }; })),
          'style_table': { 
            'margin': '12px 0', 
            'width': '100%',
            'border': '1px solid #e0e4e8',
            'borderRadius': '4px',
            'overflowX': 'auto',
            'overflowY': 'hidden',
            'display': 'block',
            'maxWidth': '100%'
          },
          'fill_width': true,
          'css': [
            { 'selector': '.dash-table-container .dash-spreadsheet-container .dash-header div', 'rule': 'display:block; white-space: normal;' },
            { 'selector': '.dash-table-container .dash-spreadsheet-container .dash-cell div', 'rule': 'display:block; white-space: normal;' }
          ]
        }
      };

      var info = { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'children': [
        { 'type': 'H4', 'namespace': 'dash_html_components', 'props': { 'children': Array.from(new Set(Array.from(totalIds))).length + ' fasters', 'className': 'results-info-title' } }
      ]}};

      var chartsWrap = { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'style': { 'display': 'flex', 'flexWrap': 'wrap' }, 'children': charts }};
      var tableWrap = { 'type': 'Div', 'namespace': 'dash_html_components', 'props': { 'children': [
        { 'type': 'H4', 'namespace': 'dash_html_components', 'props': { 'children': 'Mean Change [Confidence Interval 95%]', 'style': {'marginTop': '30px'} } },
        table
      ]}};

      return [info, chartsWrap, tableWrap];
    },
    updateCohortSection: function(cohortStore, cohortTab) {
      var vw = (typeof window !== 'undefined') ? window.innerWidth : 1024;
      var isMobile = vw <= 768;
      var key = cohortTab || 'Cohort';
      var bundle = cohortStore && cohortStore[key];
      if (!(bundle && bundle.data && bundle.columns && bundle.columns.length)) return '';
      var cohortColumns = bundle.columns.map(function(c){
        if (c && typeof c === 'object' && 'id' in c) return c;
        if (Array.isArray(c)) return { name: c, id: c.join(' | ') };
        return { name: String(c), id: String(c) };
      });
      var cohortProps = {
        'data': bundle.data,
        'columns': cohortColumns,
        'merge_duplicate_headers': true,
        'style_cell': { 'textAlign': 'left', 'fontFamily': 'Lato, sans-serif', 'fontSize': isMobile ? '12px' : '14px', 'whiteSpace': 'normal', 'padding': isMobile ? '6px 8px' : '8px 10px', 'border': 'none', 'borderBottom': '1px solid #e6e6e6', 'height':'auto', 'lineHeight':'1.25', 'minWidth': isMobile?'50px':'80px', 'maxWidth': isMobile?'130px':'none', 'width':'auto' },
        'style_header': { 'backgroundColor': '#f3f6f8', 'fontWeight': '700', 'border': 'none', 'borderBottom': '2px solid #cfd6dc', 'whiteSpace': 'normal', 'fontSize': '12px' },
        'style_table': { 'margin': '12px 0', 'width': '100%', 'border': '1px solid #e0e4e8', 'borderRadius': '4px', 'overflowX': 'auto', 'overflowY': 'hidden', 'display': 'block', 'maxWidth': '100%' },
        'fill_width': true,
        'css': [
          { 'selector': '.dash-table-container .dash-spreadsheet-container .dash-header div', 'rule': 'display:block; white-space: normal;' },
          { 'selector': '.dash-table-container .dash-spreadsheet-container .dash-cell div', 'rule': 'display:block; white-space: normal;' }
        ]
      };
      if ((key || 'Cohort') !== 'Cohort') {
        cohortProps['page_action'] = 'native';
        cohortProps['page_size'] = 8;
      }
      return {
        'type': 'DataTable', 'namespace': 'dash_table',
        'props': cohortProps
      };
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
        ? { maxHeight: '600px', overflowY: 'hidden', textAlign: 'justify', opacity: 1 }
        : { maxHeight: '40px',  overflowY: 'hidden', textAlign: 'justify', opacity: 1 };

      var gradient_style = { opacity: opened ? 0 : 1 };
      var bar_style = window.dash_clientside && window.dash_clientside.no_update ? window.dash_clientside.no_update : null;

      var button_class = opened ? 'readmore-btn opened' : 'readmore-btn';
      var button_text = opened ? 'Read less' : 'Read more';

      return [content_style, button_class, gradient_style, bar_style, button_text];
    }
  }
});


