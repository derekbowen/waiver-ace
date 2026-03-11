#!/bin/bash
# ============================================================
# Pool Rental Near Me - Sitemap Generator
#
# USAGE: Paste this entire script into your EC2 terminal.
# It will:
#   1. Find Sharetribe's public directory
#   2. Pull ALL URLs from sitemaphosting7 + Sharetribe + crawl
#   3. Filter out junk (drafts, login, signup, pagination)
#   4. Categorize with proper priorities & change frequencies
#   5. Split into organized sitemaps (under 1000 each)
#   6. Create a sitemap index
#   7. Update robots.txt
#   8. Remove the old PRO Sitemaps reference
#
# No installs needed. Uses only curl and bash.
# ============================================================

set -e

DOMAIN="https://www.poolrentalnearme.com"
SITEMAPHOSTING_URL="https://a487260.sitemaphosting7.com/4661760/sitemap.xml"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S+00:00")
TMPDIR=$(mktemp -d)

echo ""
echo "=========================================="
echo "  Pool Rental Near Me - Sitemap Builder"
echo "=========================================="
echo ""

# --- Step 1: Find Sharetribe's public directory ---
echo "[1/7] Finding Sharetribe public directory..."

PUBLIC_DIR=""
for dir in \
    /home/ubuntu/sharetribe/public \
    /var/app/current/public \
    /home/ec2-user/sharetribe/public \
    /opt/sharetribe/public \
    /home/ubuntu/app/public \
    /var/www/html \
    /var/www/public; do
    if [ -d "$dir" ]; then
        PUBLIC_DIR="$dir"
        break
    fi
done

if [ -z "$PUBLIC_DIR" ]; then
    echo "  Searching for robots.txt to find public directory..."
    ROBOTS_PATH=$(find / -name "robots.txt" -type f 2>/dev/null | head -1)
    if [ -n "$ROBOTS_PATH" ]; then
        PUBLIC_DIR=$(dirname "$ROBOTS_PATH")
    fi
fi

if [ -z "$PUBLIC_DIR" ]; then
    echo ""
    echo "  ERROR: Could not find Sharetribe public directory."
    echo "  Run this to find it manually:"
    echo "    find / -name 'robots.txt' -type f 2>/dev/null"
    echo ""
    echo "  Then re-run with:"
    echo "    PUBLIC_DIR=/path/to/public bash generate-poolrental-sitemap.sh"
    exit 1
fi

echo "  Found: $PUBLIC_DIR"
echo ""

# --- Step 2: Collect ALL URLs from every source ---
echo "[2/7] Collecting URLs from all sources..."

URLS_FILE="$TMPDIR/all_urls.txt"
touch "$URLS_FILE"

# Source 1: Pull from sitemaphosting7 (the big one - has ~2500 URLs)
echo "  Pulling from sitemaphosting7..."
curl -s "$SITEMAPHOSTING_URL" 2>/dev/null | \
    grep -oP '(?<=<loc>)[^<]+' >> "$URLS_FILE" 2>/dev/null || true
HOSTED_COUNT=$(wc -l < "$URLS_FILE")
echo "    Got $HOSTED_COUNT URLs"

# Source 2: Sharetribe's own sitemaps
echo "  Pulling from Sharetribe sitemaps..."
curl -s "${DOMAIN}/sitemap-recent-pages.xml" 2>/dev/null | \
    grep -oP '(?<=<loc>)[^<]+' >> "$URLS_FILE" 2>/dev/null || true
curl -s "${DOMAIN}/sitemap.xml" 2>/dev/null | \
    grep -oP '(?<=<loc>)[^<]+' >> "$URLS_FILE" 2>/dev/null || true

# Source 3: Crawl key hub pages for any URLs not in sitemaps
echo "  Crawling hub pages..."
for hub in "/" "/p/all-locations" "/p/hosting" "/p/blog" "/p/host-advocacy" "/s"; do
    curl -s -L "${DOMAIN}${hub}" 2>/dev/null | \
        grep -oP 'href="(/[^"]*)"' | \
        sed "s|href=\"|${DOMAIN}|;s|\"$||" >> "$URLS_FILE" 2>/dev/null || true
done

# Source 4: Crawl paginated search results
echo "  Crawling search pages..."
for page in $(seq 1 100); do
    RESULT=$(curl -s -L "${DOMAIN}/s?page=${page}" 2>/dev/null)
    if echo "$RESULT" | grep -q '/l/'; then
        echo "$RESULT" | grep -oP 'href="(/l/[^"]*)"' | \
            sed "s|href=\"|${DOMAIN}|;s|\"$||" >> "$URLS_FILE" 2>/dev/null || true
    else
        break
    fi
done

RAW_COUNT=$(wc -l < "$URLS_FILE")
echo "  Raw total (before cleanup): $RAW_COUNT"
echo ""

# --- Step 3: Clean and filter URLs ---
echo "[3/7] Cleaning and filtering URLs..."

# Remove junk URLs, duplicates, fragments, query strings
cat "$URLS_FILE" | \
    sed 's/#.*$//' | \
    sed 's/\?.*$//' | \
    grep -E "^https://(www\.)?poolrentalnearme\.com" | \
    grep -v -E '\.(jpg|jpeg|png|gif|svg|css|js|ico|pdf|woff|woff2|ttf|map)' | \
    grep -v -E '/(login|signup|password|account|admin|api|oauth|new|draft)' | \
    grep -v -E '/l/draft/' | \
    grep -v -E '/l/.*/new/' | \
    grep -v -E '00000000-0000-0000' | \
    grep -v -E '/s$' | \
    grep -v -E 'amenities\.' | \
    grep -v -E 'connect\.' | \
    grep -v -E 'help\.' | \
    grep -v -E 'go\.' | \
    sort -u > "$TMPDIR/clean_urls.txt"

TOTAL_URLS=$(wc -l < "$TMPDIR/clean_urls.txt")
echo "  Clean unique URLs: $TOTAL_URLS"
echo ""

# --- Step 4: Categorize URLs ---
echo "[4/7] Categorizing URLs into sitemap groups..."

# Category files
LISTINGS_FILE="$TMPDIR/urls_listings.txt"
HOSTS_FILE="$TMPDIR/urls_hosts.txt"
EVENTS_FILE="$TMPDIR/urls_events.txt"
CONTENT_FILE="$TMPDIR/urls_content.txt"
ADVOCACY_FILE="$TMPDIR/urls_advocacy.txt"
SPANISH_FILE="$TMPDIR/urls_spanish.txt"
CORE_FILE="$TMPDIR/urls_core.txt"

touch "$LISTINGS_FILE" "$HOSTS_FILE" "$EVENTS_FILE" "$CONTENT_FILE" "$ADVOCACY_FILE" "$SPANISH_FILE" "$CORE_FILE"

while IFS= read -r url; do
    case "$url" in
        # Spanish pages
        */es/*|*/es)
            echo "$url" >> "$SPANISH_FILE"
            ;;
        # Actual pool listings (the /l/ UUID pages)
        */l/*)
            echo "$url" >> "$LISTINGS_FILE"
            ;;
        # Become-a-host city pages
        *become-a-*host*|*become-a-pool-host*)
            echo "$url" >> "$HOSTS_FILE"
            ;;
        # Event guide pages
        *guide-to-*)
            echo "$url" >> "$EVENTS_FILE"
            ;;
        # Host advocacy / state pages
        *host-advocacy*|*-pool-rental-laws*|*-pool-sharing-laws*|*advocacy*)
            echo "$url" >> "$ADVOCACY_FILE"
            ;;
        # Core pages (homepage, about, faq, etc)
        *poolrentalnearme.com/|*poolrentalnearme.com/p/about|*poolrentalnearme.com/p/faq|*poolrentalnearme.com/p/hosting|*poolrentalnearme.com/p/howitworksforguests|*poolrentalnearme.com/p/make-money|*poolrentalnearme.com/p/all-locations|*poolrentalnearme.com/terms-of-service|*poolrentalnearme.com/privacy-policy|*poolrentalnearme.com/p/water-savings|*poolrentalnearme.com/p/zerodrowning|*poolrentalnearme.com/p/accesstopoolrentals|*poolrentalnearme.com/p/investors|*poolrentalnearme.com/p/swimply-alternative*|*poolrentalnearme.com/p/hoa-pool-rental-defense-kit|*poolrentalnearme.com/p/pricing*)
            echo "$url" >> "$CORE_FILE"
            ;;
        # City search/landing pages
        *poolrentalnearme.com/p/las-vegas*|*poolrentalnearme.com/p/katy*|*poolrentalnearme.com/p/newyork*|*poolrentalnearme.com/p/losangeles*|*poolrentalnearme.com/p/riverside*|*poolrentalnearme.com/p/privatepoolrentals*|*poolrentalnearme.com/p/sacramento*)
            echo "$url" >> "$CORE_FILE"
            ;;
        # Everything else in /p/ is content
        */p/*)
            echo "$url" >> "$CONTENT_FILE"
            ;;
        # Anything else
        *)
            echo "$url" >> "$CONTENT_FILE"
            ;;
    esac
done < "$TMPDIR/clean_urls.txt"

echo "  Core pages:                   $(wc -l < "$CORE_FILE")"
echo "  Pool listings:                $(wc -l < "$LISTINGS_FILE")"
echo "  Become-a-host pages:          $(wc -l < "$HOSTS_FILE")"
echo "  Event guides:                 $(wc -l < "$EVENTS_FILE")"
echo "  Content/articles:             $(wc -l < "$CONTENT_FILE")"
echo "  Host advocacy/state pages:    $(wc -l < "$ADVOCACY_FILE")"
echo "  Spanish pages:                $(wc -l < "$SPANISH_FILE")"
echo ""

# --- Step 5: Generate sitemap XML files ---
echo "[5/7] Generating sitemap XML files..."

generate_sitemap() {
    local input_file="$1"
    local sitemap_name="$2"
    local changefreq="$3"
    local priority="$4"
    local count=$(wc -l < "$input_file")

    if [ "$count" -eq 0 ]; then
        echo "  Skipped $sitemap_name (0 URLs)"
        return
    fi

    if [ "$count" -gt 1000 ]; then
        # Split into multiple files
        local part=1
        local line_num=0

        while IFS= read -r url; do
            if [ $((line_num % 1000)) -eq 0 ]; then
                if [ "$line_num" -gt 0 ]; then
                    echo '</urlset>' >> "${PUBLIC_DIR}/${sitemap_name}-${part}.xml"
                    part=$((part + 1))
                fi
                cat > "${PUBLIC_DIR}/${sitemap_name}-${part}.xml" << XMLHEADER
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
XMLHEADER
            fi
            echo "  <url>" >> "${PUBLIC_DIR}/${sitemap_name}-${part}.xml"
            echo "    <loc>${url}</loc>" >> "${PUBLIC_DIR}/${sitemap_name}-${part}.xml"
            echo "    <lastmod>${TIMESTAMP}</lastmod>" >> "${PUBLIC_DIR}/${sitemap_name}-${part}.xml"
            echo "    <changefreq>${changefreq}</changefreq>" >> "${PUBLIC_DIR}/${sitemap_name}-${part}.xml"
            echo "    <priority>${priority}</priority>" >> "${PUBLIC_DIR}/${sitemap_name}-${part}.xml"
            echo "  </url>" >> "${PUBLIC_DIR}/${sitemap_name}-${part}.xml"
            line_num=$((line_num + 1))
        done < "$input_file"
        echo '</urlset>' >> "${PUBLIC_DIR}/${sitemap_name}-${part}.xml"
        echo "  Created ${sitemap_name}-1.xml through ${sitemap_name}-${part}.xml ($count URLs)"
    else
        {
            echo '<?xml version="1.0" encoding="UTF-8"?>'
            echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            while IFS= read -r url; do
                echo "  <url>"
                echo "    <loc>${url}</loc>"
                echo "    <lastmod>${TIMESTAMP}</lastmod>"
                echo "    <changefreq>${changefreq}</changefreq>"
                echo "    <priority>${priority}</priority>"
                echo "  </url>"
            done < "$input_file"
            echo '</urlset>'
        } > "${PUBLIC_DIR}/${sitemap_name}.xml"
        echo "  Created ${sitemap_name}.xml ($count URLs)"
    fi
}

# Generate each sitemap with appropriate priority and changefreq
#                    input_file      name                changefreq  priority
generate_sitemap "$CORE_FILE"      "sitemap-core"      "weekly"     "1.0"
generate_sitemap "$LISTINGS_FILE"  "sitemap-listings"  "weekly"     "0.9"
generate_sitemap "$HOSTS_FILE"     "sitemap-hosts"     "weekly"     "0.8"
generate_sitemap "$EVENTS_FILE"    "sitemap-events"    "monthly"    "0.7"
generate_sitemap "$CONTENT_FILE"   "sitemap-content"   "monthly"    "0.8"
generate_sitemap "$ADVOCACY_FILE"  "sitemap-advocacy"  "monthly"    "0.7"
generate_sitemap "$SPANISH_FILE"   "sitemap-spanish"   "monthly"    "0.7"

echo ""

# --- Step 6: Generate sitemap index ---
echo "[6/7] Creating sitemap index..."

SITEMAP_INDEX="${PUBLIC_DIR}/sitemap-index.xml"

{
    echo '<?xml version="1.0" encoding="UTF-8"?>'
    echo '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

    # Find all our generated sitemap files
    for f in $(ls "${PUBLIC_DIR}"/sitemap-*.xml 2>/dev/null | sort); do
        fname=$(basename "$f")
        # Skip the index itself and Sharetribe's auto-generated one
        if [ "$fname" = "sitemap-index.xml" ] || [ "$fname" = "sitemap-recent-pages.xml" ]; then
            continue
        fi
        echo "  <sitemap>"
        echo "    <loc>${DOMAIN}/${fname}</loc>"
        echo "    <lastmod>${TIMESTAMP}</lastmod>"
        echo "  </sitemap>"
    done

    echo '</sitemapindex>'
} > "$SITEMAP_INDEX"

echo "  Created sitemap-index.xml"
echo ""

# --- Step 7: Update robots.txt ---
echo "[7/7] Updating robots.txt..."

ROBOTS_FILE="${PUBLIC_DIR}/robots.txt"

if [ -f "$ROBOTS_FILE" ]; then
    cp "$ROBOTS_FILE" "${ROBOTS_FILE}.bak"
    echo "  Backed up robots.txt -> robots.txt.bak"

    # Remove ALL existing Sitemap lines (kills the dead sitemaphosting7 ref)
    sed -i '/^[Ss]itemap:/d' "$ROBOTS_FILE"

    # Remove any blank lines at the end
    sed -i -e :a -e '/^\n*$/{$d;N;ba' -e '}' "$ROBOTS_FILE" 2>/dev/null || true

    # Add our new sitemap index reference
    echo "" >> "$ROBOTS_FILE"
    echo "Sitemap: ${DOMAIN}/sitemap-index.xml" >> "$ROBOTS_FILE"

    echo "  Removed old sitemaphosting7 reference"
    echo "  Added: Sitemap: ${DOMAIN}/sitemap-index.xml"
else
    cat > "$ROBOTS_FILE" << 'ROBOTS'
User-agent: *
Allow: /

ROBOTS
    echo "Sitemap: ${DOMAIN}/sitemap-index.xml" >> "$ROBOTS_FILE"
    echo "  Created new robots.txt"
fi

echo ""

# --- Summary ---
echo "=========================================="
echo "  ALL DONE"
echo "=========================================="
echo ""
echo "  Total URLs indexed: $TOTAL_URLS"
echo "  Files created in:   $PUBLIC_DIR"
echo ""
echo "  Sitemap files:"
ls -la "${PUBLIC_DIR}"/sitemap-*.xml 2>/dev/null | awk '{print "    " $NF " (" $5 " bytes)"}'
echo ""
echo "  robots.txt now says:"
grep -i sitemap "$ROBOTS_FILE" 2>/dev/null | sed 's/^/    /'
echo ""
echo "  Verify with:"
echo "    curl -s ${DOMAIN}/robots.txt"
echo "    curl -s ${DOMAIN}/sitemap-index.xml | head -30"
echo "    curl -s ${DOMAIN}/sitemap-core.xml | head -20"
echo ""
echo "  No restart needed. Takes effect immediately."
echo "=========================================="

# Cleanup temp files
rm -rf "$TMPDIR"
