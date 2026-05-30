# Dealer Economics Priors

Industry priors by segment. Used by Pass 1 to estimate dealer volume, margin range, and structural pressures. These are publicly-known approximations, not Ekho proprietary data. Use as guardrails when scraped data is sparse.

## Motorcycle and powersports dealers (US)

- **Avg gross profit per unit (new)**: $1,400 to $2,200 depending on brand mix
- **Avg gross profit per unit (used)**: $1,800 to $2,800 (used skews higher)
- **F&I gross per unit**: $900 to $1,600 (financing, insurance, extended service contracts)
- **Service revenue**: 20-30% of total dealership revenue at healthy stores
- **Inventory days on lot target**: 90-120 days new, 45-75 used
- **Top OEMs by US unit volume**: Honda, Yamaha, Polaris, Kawasaki, Can-Am, Harley-Davidson, Suzuki
- **Out-of-state shipping**: typically 5-15% of unit volume for generalist dealers; up to 80% for used-specialty stores

## RV dealers (US)

- **Avg gross profit per unit (new motorhome Class A)**: $20,000 to $60,000
- **Avg gross profit per unit (travel trailer)**: $3,000 to $8,000
- **F&I gross per unit**: $1,800 to $4,500
- **Service revenue**: 35-50% of revenue (RV service is the moat)
- **Inventory days on lot**: 180-240+ (slower-moving, big-ticket)
- **Top brands by US volume**: Winnebago, Forest River, Thor, Jayco, Tiffin, Newmar
- **Cross-state titling**: structurally heavier than motorcycles; full-time titling clerk common

## Independent used-car dealers (US)

- **Avg gross profit per unit (used)**: $1,400 to $2,200 (mass-market); $3,500+ (luxury independents)
- **F&I gross per unit**: $1,100 to $1,800
- **Reconditioning cost per unit**: $800 to $1,500
- **Inventory days on lot target**: 30-60 days; over 90 days = forced wholesale
- **Out-of-state shipping**: rising fast (Carvana effect); 10-25% of volume for digitally-active independents
- **Competitive structure**: head-to-head with Carvana, CarMax, AutoNation, and franchise used departments

## Structural pressures that show up in dealer outbound (all segments)

- **Floorplan interest**: each unit on the lot costs $30-$80/month in floorplan financing. Days-on-lot is the silent gross-killer.
- **Trade-in pricing**: a 5% miss on trade-in ACV compounds across the inventory turn into 15-25% of net margin.
- **Lead waste**: 60-75% of digital leads are never re-contacted past day 3. The follow-up cadence is the moat.
- **F&I attach rate**: every 10% attach-rate improvement on extended service contracts adds 6-9% to dealer net.
- **Compliance friction**: cross-state sales fail at 12-25% rate without integrated titling/registration tooling. The Ekho moat.

## Inputs we usually have versus inputs we usually don't

| Signal | Source | Reliability |
|---|---|---|
| Brand mix | Website inventory listing | High |
| Geographic market | Address on site | High |
| Approximate volume tier | Inventory count + brand mix | Medium |
| New vs used split | Inventory page | High |
| Service department depth | Service page detail | Medium |
| Financing partners | Footer / financing page | High |
| Actual gross per unit | Never disclosed | Inferred from priors |
| Days-on-lot | Never disclosed | Inferred from inventory tag freshness |
| F&I attach rate | Never disclosed | Inferred from priors |
| Internet lead conversion | Never disclosed | Use 5-12% prior |

When inferring, name the inference. "Based on a 2,000-3,500 unit/year volume tier and a typical multi-brand mix, your F&I attach gross is likely sitting around X." Never present an inferred number as a known one.
