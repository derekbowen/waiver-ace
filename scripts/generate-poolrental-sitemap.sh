#!/bin/bash
# ============================================================
# Pool Rental Near Me - Sitemap Generator
#
# USAGE: Just paste this entire script into your EC2 terminal.
# It will:
#   1. Find Sharetribe's public directory
#   2. Crawl poolrentalnearme.com to discover ALL pages
#   3. Split URLs into category-based sitemaps (under 1000 each)
#   4. Create a sitemap index file
#   5. Update robots.txt to point to the new sitemap index
#   6. Remove the dead PRO Sitemaps reference
#
# No installs needed. Uses only curl and bash.
# ============================================================

set -e

DOMAIN="https://www.poolrentalnearme.com"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S+00:00")
TMPDIR=$(mktemp -d)

echo ""
echo "=========================================="
echo "  Pool Rental Near Me - Sitemap Builder"
echo "=========================================="
echo ""

# --- Step 1: Find Sharetribe's public directory ---
echo "[1/6] Finding Sharetribe public directory..."

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

# If not found in common locations, search for robots.txt
if [ -z "$PUBLIC_DIR" ]; then
    echo "  Searching for robots.txt to find public directory..."
    ROBOTS_PATH=$(find / -name "robots.txt" -type f 2>/dev/null | head -1)
    if [ -n "$ROBOTS_PATH" ]; then
        PUBLIC_DIR=$(dirname "$ROBOTS_PATH")
    fi
fi

if [ -z "$PUBLIC_DIR" ]; then
    echo "  ERROR: Could not find Sharetribe public directory."
    echo "  Please run: find / -name 'robots.txt' -type f 2>/dev/null"
    echo "  Then re-run this script with: PUBLIC_DIR=/path/to/public bash $0"
    exit 1
fi

echo "  Found: $PUBLIC_DIR"
echo ""

# --- Step 2: Crawl the site to discover all URLs ---
echo "[2/6] Crawling $DOMAIN to discover all pages..."
echo "  This may take a few minutes for 2000+ pages..."
echo ""

URLS_FILE="$TMPDIR/all_urls.txt"

# Start with the existing Sharetribe sitemap if available
echo "  Checking for existing Sharetribe sitemap..."
curl -s "${DOMAIN}/sitemap-recent-pages.xml" 2>/dev/null | \
    grep -oP '(?<=<loc>)[^<]+' >> "$URLS_FILE" 2>/dev/null || true
curl -s "${DOMAIN}/sitemap.xml" 2>/dev/null | \
    grep -oP '(?<=<loc>)[^<]+' >> "$URLS_FILE" 2>/dev/null || true

EXISTING_COUNT=$(wc -l < "$URLS_FILE" 2>/dev/null || echo "0")
echo "  Found $EXISTING_COUNT URLs from existing sitemaps"

# Crawl hub/index pages to find linked pages
echo "  Crawling hub pages for additional URLs..."

HUB_PAGES=(
    "/"
    "/all-locations"
    "/s"
    "/en/s"
    "/es/s"
)

for hub in "${HUB_PAGES[@]}"; do
    echo "    Crawling ${DOMAIN}${hub}..."
    curl -s -L "${DOMAIN}${hub}" 2>/dev/null | \
        grep -oP "href=\"${DOMAIN}[^\"]*\"" | \
        sed 's/href="//;s/"$//' >> "$URLS_FILE" 2>/dev/null || true
    curl -s -L "${DOMAIN}${hub}" 2>/dev/null | \
        grep -oP 'href="/[^"]*"' | \
        sed "s|href=\"|${DOMAIN}|;s|\"$||" >> "$URLS_FILE" 2>/dev/null || true
done

# Crawl category/listing pages to find deeper links
echo "  Crawling category pages..."
# Get links from the pages we already found, looking for listing/category pages
CATEGORY_URLS=$(grep -E '(/p/|/c/|/l/|/become-a-host|/guide-to-|/host-|/pool-rental-)' "$URLS_FILE" | sort -u | head -100)

for cat_url in $CATEGORY_URLS; do
    curl -s -L "$cat_url" 2>/dev/null | \
        grep -oP "href=\"${DOMAIN}[^\"]*\"" | \
        sed 's/href="//;s/"$//' >> "$URLS_FILE" 2>/dev/null || true
    curl -s -L "$cat_url" 2>/dev/null | \
        grep -oP 'href="/[^"]*"' | \
        sed "s|href=\"|${DOMAIN}|;s|\"$||" >> "$URLS_FILE" 2>/dev/null || true
done

# Also try paginated listing pages
echo "  Checking paginated listings..."
for page in $(seq 1 50); do
    RESULT=$(curl -s -L "${DOMAIN}/s?page=${page}" 2>/dev/null)
    if echo "$RESULT" | grep -q 'href="/'; then
        echo "$RESULT" | grep -oP 'href="/[^"]*"' | \
            sed "s|href=\"|${DOMAIN}|;s|\"$||" >> "$URLS_FILE" 2>/dev/null || true
    else
        break
    fi
done

# Clean up URLs: remove duplicates, fragments, query strings (except page), sort
echo "  Cleaning up URL list..."
cat "$URLS_FILE" | \
    sed 's/#.*$//' | \
    sed 's/\?.*$//' | \
    grep -E "^${DOMAIN}" | \
    grep -v -E '\.(jpg|jpeg|png|gif|svg|css|js|ico|pdf|woff|woff2|ttf)$' | \
    grep -v -E '(login|signup|password|account|admin|api|oauth)' | \
    sort -u > "$TMPDIR/clean_urls.txt"

TOTAL_URLS=$(wc -l < "$TMPDIR/clean_urls.txt")
echo ""
echo "  Total unique URLs discovered: $TOTAL_URLS"
echo ""

# --- Step 3: Categorize URLs ---
echo "[3/6] Categorizing URLs into sitemap groups..."

# Category files
HOSTS_FILE="$TMPDIR/urls_hosts.txt"
EVENTS_FILE="$TMPDIR/urls_events.txt"
CONTENT_FILE="$TMPDIR/urls_content.txt"
ADVOCACY_FILE="$TMPDIR/urls_advocacy.txt"
SPANISH_FILE="$TMPDIR/urls_spanish.txt"
CORE_FILE="$TMPDIR/urls_core.txt"
OTHER_FILE="$TMPDIR/urls_other.txt"

touch "$HOSTS_FILE" "$EVENTS_FILE" "$CONTENT_FILE" "$ADVOCACY_FILE" "$SPANISH_FILE" "$CORE_FILE" "$OTHER_FILE"

while IFS= read -r url; do
    case "$url" in
        */es/*|*/es)
            echo "$url" >> "$SPANISH_FILE" ;;
        *become-a-host*|*become-a-pool-host*|*/l/*)
            echo "$url" >> "$HOSTS_FILE" ;;
        *guide-to-*|*event-guide*|*event-rental*)
            echo "$url" >> "$EVENTS_FILE" ;;
        *host-advocacy*|*state-*|*-laws*|*-regulations*)
            echo "$url" >> "$ADVOCACY_FILE" ;;
        *blog*|*article*|*content*|*/p/*)
            echo "$url" >> "$CONTENT_FILE" ;;
        */|*/about|*/contact|*/terms|*/privacy|*/faq|*/pricing|*/how-it-works|*/all-locations)
            echo "$url" >> "$CORE_FILE" ;;
        *)
            echo "$url" >> "$OTHER_FILE" ;;
    esac
done < "$TMPDIR/clean_urls.txt"

echo "  Hosts (become-a-host pages):  $(wc -l < "$HOSTS_FILE")"
echo "  Events (event guides):        $(wc -l < "$EVENTS_FILE")"
echo "  Content (articles):           $(wc -l < "$CONTENT_FILE")"
echo "  Advocacy (state pages):       $(wc -l < "$ADVOCACY_FILE")"
echo "  Spanish:                      $(wc -l < "$SPANISH_FILE")"
echo "  Core pages:                   $(wc -l < "$CORE_FILE")"
echo "  Other:                        $(wc -l < "$OTHER_FILE")"
echo ""

# --- Step 4: Generate sitemap XML files ---
echo "[4/6] Generating sitemap XML files..."

generate_sitemap() {
    local input_file="$1"
    local output_file="$2"
    local changefreq="$3"
    local priority="$4"
    local count=$(wc -l < "$input_file")

    if [ "$count" -eq 0 ]; then
        return
    fi

    # If over 1000 URLs, split into multiple files
    if [ "$count" -gt 1000 ]; then
        local base_name=$(basename "$output_file" .xml)
        local part=1
        local line_num=0

        while IFS= read -r url; do
            if [ $((line_num % 1000)) -eq 0 ]; then
                if [ "$line_num" -gt 0 ]; then
                    echo '</urlset>' >> "${PUBLIC_DIR}/${base_name}-${part}.xml"
                    part=$((part + 1))
                fi
                cat > "${PUBLIC_DIR}/${base_name}-${part}.xml" << XMLHEADER
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
XMLHEADER
            fi
            echo "  <url><loc>${url}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>" >> "${PUBLIC_DIR}/${base_name}-${part}.xml"
            line_num=$((line_num + 1))
        done < "$input_file"
        echo '</urlset>' >> "${PUBLIC_DIR}/${base_name}-${part}.xml"
        echo "  Created ${part} files for ${base_name} (${count} URLs)"
    else
        {
            echo '<?xml version="1.0" encoding="UTF-8"?>'
            echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            while IFS= read -r url; do
                echo "  <url><loc>${url}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>"
            done < "$input_file"
            echo '</urlset>'
        } > "${PUBLIC_DIR}/$(basename "$output_file")"
        echo "  Created $(basename "$output_file") (${count} URLs)"
    fi
}

generate_sitemap "$CORE_FILE" "sitemap-core.xml" "weekly" "1.0"
generate_sitemap "$HOSTS_FILE" "sitemap-hosts.xml" "weekly" "0.8"
generate_sitemap "$EVENTS_FILE" "sitemap-events.xml" "monthly" "0.7"
generate_sitemap "$CONTENT_FILE" "sitemap-content.xml" "monthly" "0.8"
generate_sitemap "$ADVOCACY_FILE" "sitemap-advocacy.xml" "monthly" "0.7"
generate_sitemap "$SPANISH_FILE" "sitemap-spanish.xml" "monthly" "0.7"
generate_sitemap "$OTHER_FILE" "sitemap-other.xml" "monthly" "0.6"

echo ""

# --- Step 5: Generate sitemap index ---
echo "[5/6] Creating sitemap index..."

SITEMAP_INDEX="${PUBLIC_DIR}/sitemap-index.xml"

{
    echo '<?xml version="1.0" encoding="UTF-8"?>'
    echo '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

    for f in "${PUBLIC_DIR}"/sitemap-*.xml; do
        fname=$(basename "$f")
        if [ "$fname" != "sitemap-index.xml" ] && [ "$fname" != "sitemap-recent-pages.xml" ]; then
            echo "  <sitemap>"
            echo "    <loc>${DOMAIN}/${fname}</loc>"
            echo "    <lastmod>${TIMESTAMP}</lastmod>"
            echo "  </sitemap>"
        fi
    done

    echo '</sitemapindex>'
} > "$SITEMAP_INDEX"

echo "  Created sitemap-index.xml"
echo ""

# --- Step 6: Update robots.txt ---
echo "[6/6] Updating robots.txt..."

ROBOTS_FILE="${PUBLIC_DIR}/robots.txt"

if [ -f "$ROBOTS_FILE" ]; then
    # Back up existing robots.txt
    cp "$ROBOTS_FILE" "${ROBOTS_FILE}.bak"
    echo "  Backed up existing robots.txt to robots.txt.bak"

    # Remove any existing Sitemap lines (including the dead PRO Sitemaps one)
    sed -i '/^Sitemap:/d' "$ROBOTS_FILE"

    # Add new sitemap reference
    echo "" >> "$ROBOTS_FILE"
    echo "Sitemap: ${DOMAIN}/sitemap-index.xml" >> "$ROBOTS_FILE"

    echo "  Updated robots.txt - removed old sitemap references, added sitemap-index.xml"
else
    # Create a new robots.txt
    cat > "$ROBOTS_FILE" << ROBOTS
User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap-index.xml
ROBOTS
    echo "  Created new robots.txt"
fi

echo ""

# --- Done ---
echo "=========================================="
echo "  DONE!"
echo "=========================================="
echo ""
echo "  Sitemap index: ${DOMAIN}/sitemap-index.xml"
echo "  Total URLs indexed: $TOTAL_URLS"
echo "  Files created in: $PUBLIC_DIR"
echo ""
echo "  Sitemap files:"
ls -la "${PUBLIC_DIR}"/sitemap-*.xml 2>/dev/null
echo ""
echo "  Updated robots.txt:"
cat "$ROBOTS_FILE"
echo ""
echo "  Verify it's working:"
echo "    curl ${DOMAIN}/sitemap-index.xml | head -20"
echo "    curl ${DOMAIN}/robots.txt"
echo ""
echo "  No restart needed - these are static files."
echo "=========================================="

# Cleanup
rm -rf "$TMPDIR"
