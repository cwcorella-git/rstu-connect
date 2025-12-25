const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: '192.168.1.15',
  port: 5432,
  database: 'veritable_games',
  user: 'postgres',
  password: 'postgres'
});

async function queryPriorityDocuments() {
  const client = await pool.connect();

  try {
    // Priority authors
    const priorityAuthors = [
      'Murray Bookchin',
      'Peter Kropotkin',
      'David Graeber',
      'Emma Goldman',
      'Mikhail Bakunin'
    ];

    // Query for documents by priority authors
    console.log('Querying documents by priority authors...\n');
    const authorQuery = `
      SELECT title, author, publication_date, slug, language
      FROM anarchist.documents
      WHERE author IN ($1, $2, $3, $4, $5)
      ORDER BY publication_date DESC
      LIMIT 200
    `;
    const authorResults = await client.query(authorQuery, priorityAuthors);

    console.log(`Found ${authorResults.rows.length} documents by priority authors\n`);
    console.log('Top 10 documents by priority authors:');
    console.log('='.repeat(80));
    authorResults.rows.slice(0, 10).forEach((doc, idx) => {
      console.log(`${idx + 1}. ${doc.title}`);
      console.log(`   Author: ${doc.author}`);
      console.log(`   Date: ${doc.publication_date || 'N/A'}`);
      console.log(`   Slug: ${doc.slug}`);
      console.log(`   Language: ${doc.language || 'N/A'}`);
      console.log('');
    });

    // Query for housing-related documents
    console.log('\nQuerying housing-related documents...\n');
    const housingQuery = `
      SELECT title, author, publication_date, slug, language
      FROM anarchist.documents
      WHERE
        LOWER(title) LIKE '%rent%' OR
        LOWER(title) LIKE '%tenant%' OR
        LOWER(title) LIKE '%housing%' OR
        LOWER(title) LIKE '%landlord%' OR
        LOWER(title) LIKE '%eviction%' OR
        LOWER(title) LIKE '%lease%'
      ORDER BY publication_date DESC
      LIMIT 200
    `;
    const housingResults = await client.query(housingQuery);

    console.log(`Found ${housingResults.rows.length} housing-related documents\n`);
    console.log('Top 10 housing-related documents:');
    console.log('='.repeat(80));
    housingResults.rows.slice(0, 10).forEach((doc, idx) => {
      console.log(`${idx + 1}. ${doc.title}`);
      console.log(`   Author: ${doc.author || 'Unknown'}`);
      console.log(`   Date: ${doc.publication_date || 'N/A'}`);
      console.log(`   Slug: ${doc.slug}`);
      console.log(`   Language: ${doc.language || 'N/A'}`);
      console.log('');
    });

    // Combine results and deduplicate by slug
    const allDocuments = [...authorResults.rows, ...housingResults.rows];
    const uniqueDocuments = Array.from(
      new Map(allDocuments.map(doc => [doc.slug, doc])).values()
    );

    // Sort by publication date (newest first) and limit to 200
    const sortedDocuments = uniqueDocuments
      .sort((a, b) => {
        const dateA = a.publication_date ? new Date(a.publication_date) : new Date(0);
        const dateB = b.publication_date ? new Date(b.publication_date) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 200);

    // Prepare output structure
    const output = {
      metadata: {
        queryDate: new Date().toISOString(),
        totalDocuments: sortedDocuments.length,
        priorityAuthors: priorityAuthors,
        housingKeywords: ['rent', 'tenant', 'housing', 'landlord', 'eviction', 'lease']
      },
      documents: sortedDocuments.map(doc => ({
        title: doc.title,
        author: doc.author || null,
        publication_date: doc.publication_date || null,
        slug: doc.slug,
        language: doc.language || null
      }))
    };

    // Save to JSON file
    const outputPath = path.join(__dirname, '..', 'data', 'priority-documents.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log(`\nSummary:`);
    console.log(`- Documents by priority authors: ${authorResults.rows.length}`);
    console.log(`- Housing-related documents: ${housingResults.rows.length}`);
    console.log(`- Total unique documents: ${sortedDocuments.length}`);
    console.log(`\nSaved to: ${outputPath}`);

  } catch (error) {
    console.error('Error querying database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

queryPriorityDocuments().catch(console.error);
