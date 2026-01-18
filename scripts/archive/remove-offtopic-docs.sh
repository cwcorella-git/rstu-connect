#!/bin/bash

# Off-topic files to remove
# ML/AI arXiv papers, psychology papers, tax returns, etc.

DOCS_DIR="/home/user/Projects/rstu-connect/docs"

echo "=== Removing off-topic documents ==="
echo ""

# List of files to remove (patterns)
OFF_TOPIC_FILES=(
    # ML/AI arXiv papers
    "2301.07608.md"
    "2306.16527.md"
    "2306.17156.md"
    "2307.00040.md"
    "2307.00184.md"
    "2307.01097.md"
    "2307.01197.md"
    "2309.02427.md"
    "2309.07864.md"
    "2309.07918.md"
    "2312.17653.md"
    
    # Other off-topic
    "2017-03-nasa-magnetic-shield-mars-atmosphere.md"
    "2022_TaxReturn.md"
    "259963_25a744b6-5a68-4405-8c6b-e821d890f8ba.md"
    "Ambivalence - Wikipedia.md"
    "1 - Feldman-Barrett_L-Constructing_Emotion.md"
    "Dedifferentiation_maintains_melanocyte_stem_cells_in_a_dynamic_niche_-_s41586-023-05960-6.md"
    "Running_Head_ONLINE_EMOTION_REGULATION_INTERVENTIONS_FOR_PARENTS_DURING_A.md"
    "The_Space_Between_Us__A_Social-Functional_Emotions_View_of_Ambivalent_and_Indifferent_Workplace_Relationships.md"
    "The_Space_Between_Us__A_Social-Functional_Emotions_View_of_Ambivalent_and_Indifferent_Workplace_Relationships-1.md"
    "The_Space_Between_Us__A_Social-Functional_Emotions_View_of_Ambivalent_and_Indifferent_Workplace_Relationships-2.md"
    "101 Things I Learned_sup_TM__su - Matthew Frederick.md"
    
    # ADOP graphics paper
    "ADOP_Approximate_Differentiable_One-Pixel_Point_RenderingADOP_Approximate_Differentiable_One-Pixel_Point_Rendering_-_2110.06635.md"
)

REMOVED=0
NOT_FOUND=0

for filename in "${OFF_TOPIC_FILES[@]}"; do
    # Find the file anywhere in docs directory
    found=$(find "$DOCS_DIR" -name "$filename" -type f 2>/dev/null)
    
    if [ -n "$found" ]; then
        echo "Removing: $found"
        rm "$found"
        ((REMOVED++))
    else
        echo "Not found: $filename"
        ((NOT_FOUND++))
    fi
done

echo ""
echo "=== Summary ==="
echo "Removed: $REMOVED files"
echo "Not found: $NOT_FOUND files"
echo ""
echo "Now regenerate the manifest with: node scripts/generate-reading-manifest.js"
