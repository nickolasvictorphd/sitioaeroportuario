# Superficies OLS/OES 3D - SBXY ficticio

Referência vertical: elevação do aeródromo/pista = 760 m MSL.  
Altitude KML recomendada/usada: `absolute`.  
Topo do silo: 851 m MSL.

| Superficie | Cabeceira | Tipo | Regra de altitude | Altitude/limite no silo | Resultado |
|---|---|---|---|---:|---|
| OLS_aproximacao_RWY03_3D | 03 deslocada | inclinada | 760 + d x 0,02 | 790,9 m MSL | Penetra 60,1 m |
| OLS_aproximacao_RWY21_3D | 21 | inclinada | 760 + d x 0,02 | N/A | Fora |
| OLS_subida_decolagem_RWY21_3D_TODA2600 | 21 | inclinada | 760 + d x 0,02 | 782,1 m MSL | Penetra 68,9 m |
| OLS_subida_decolagem_RWY03_3D | 03 | inclinada | 760 + d x 0,02 | N/A | Fora |
| OLS_transicao_lateral_faixa_3D | 03/21 | inclinada | 760 + afastamento/7 | N/A | Fora da transicao lateral da faixa |
| OLS_horizontal_interna_805MSL_3D | 03/21 | constante | 760 + 45 | 805,0 m MSL | Penetra 46,0 m |
| OLS_conica_3D | 03/21 | inclinada | 805 + (raio - 4000) x 0,05 | N/A | Silo dentro da horizontal interna, nao na conica |
| OES_horizontal_90m_850MSL_3D | 03/21 | constante | 760 + 90 | 850,0 m MSL | Penetra 1,0 m |

A tabela completa de vertices esta em `vertices_OLS_OES_3D.tsv` com as colunas: Superficie, Cabeceira, Vertice, Latitude, Longitude, Altitude_MSL, S_m, L_m.
