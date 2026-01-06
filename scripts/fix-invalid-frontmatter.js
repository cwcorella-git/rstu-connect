#!/usr/bin/env node
/**
 * Fix invalid frontmatter in markdown files
 * Issues: markdown formatting in titles (**bold**, ##, URLs, escaped chars)
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');

// List of files with invalid frontmatter (from generate-reading-manifest.js output)
const invalidFiles = `abolition/Soledad's Black prisoners brutalized in 3 a.m. raid report guards warned, 'You Nggers will have COVI.md
anti-war-peace/A view on Class War by a former member - Julian (1986).md
anti-war-peace/Class War bashing the rich.md
anti-war-peace/Judge Lynch, you have the floor! The murder of Farion amid the decay processes in the warring armies.md
anti-war-peace/Your Wars! Our Dead! "Sir! No Sir!".md
arts-culture-music/Molasses_Flood_Pitchbook.0.md
arts-culture-music/Textbooks are becoming obsolete says Bill Gates.md
contemporary-analysis/ChatGPT Gets Its "Wolfram Superpowers"!—Stephen Wolfram Writings.md
contemporary-analysis/Dissecting the right's free speech rhetoric.md
contemporary-analysis/Finch-Original-Concept-Doc.md
contemporary-analysis/Full text of _We Dont Need Gun Control We Need To Take Control_.md
contemporary-analysis/GE Tree Company ArborGen Found Guilty of Defrauding Workers, Fined $53.5M.md
contemporary-analysis/Hope in the Collapse.md
contemporary-analysis/How We Can Make Solarpunk A Reality.md
contemporary-analysis/How We Handle Harm.md
contemporary-analysis/How the pigs abuse 'gang' labels - Kevin Rashid Johnson.md
contemporary-analysis/Love as a Revolutionary Social Ethic.md
contemporary-analysis/Microsoft Word - Heidegger What Is Metaphysics_.doc - 61346898-Heidegger-What-is-Metaphysics.md
contemporary-analysis/Montague Monty Miller - 1831 -1920.md
contemporary-analysis/Mumia Abu-Jamal on outside agitators and the meaning of Ferguson.md
contemporary-analysis/My Workplace Is Uniquely Bad - A kind of disordered thinking that every organiser will encounter.md
contemporary-analysis/No Matter How Difficult - Julio Comrade Z Zuniga.md
contemporary-analysis/Principles of Decorative Design _ Fourth E - Christopher Dresser.md
contemporary-analysis/RWU Urges Operating Crafts to  Vote No!  Defeat the Tentative Agreement.md
contemporary-analysis/Reflections on Revolutionary Defeatism — Lefty Hooligan.md
contemporary-analysis/The Concept of Collective Consciousness, Defined.md
contemporary-analysis/The letters of Os Cangaceiros in relation to 13,000 Escapes.md
contemporary-analysis/The "Left-Wingers" and the IWW.md
contemporary-analysis/a prelude "blessed," meaning washed with blood.md
contemporary-analysis/structure of proletarian unfreedom.md
contemporary-analysis/"Black" anger shakes the rotten pillars of bourgeois and democratic "civilization" - Bordiga, 1965.md
contemporary-analysis/"Now and then the flame dies down, but solidarity is a stream of sparks".md
economic-alternatives/No Love for Deliveroo! A reflection on organising and mobilising in the "gig" economy.md
economic-alternatives/Not a single wheel can turn Further thoughts on organising and mobilising in the "gig" economy.md
environmental-justice/Bridgeport Residents Release Balloon Banner at City Hall "Fracked Gas is Environmental Racism".md
environmental-justice/Canada's New Anti-Terrorism Act and the "Green Syndicalist Menace".md
environmental-justice/IWW WISERA Environmental Committee and NARA IWW EUC Reading Group 1 Judi Bari, Revolutionary Ecology.md
environmental-justice/Join us in the Anti-Capitalist Contingent at the Rally for 100% Renewable Energy for 100% of the Peo.md
environmental-justice/What is Deep Water Culture (DWC system) - Tutorial ★ January 2023.md
feminist-theory/Beauty Talk the Jezebel, the Mammy, and the third gender of Black woman.md
feminist-theory/Beyond Rhetoric – What Does the "Just Transition" Mean for DAPL.md
feminist-theory/Feminismforthe99Percent_AManifesto1.md
feminist-theory/Unions, Environmental Justice Advocates Say "No!" To Coal Transport through Oakland.md
feminist-theory/What kind of just transition.md
feminist-theory/Wrath Over Pride A call-out post to "radical" cis (het) men and their inadequacy in gender struggles.md
feminist-theory/"'Women of Peace' We Are Not" Feminist Militants in the West German Autonomen - Patricia Melzer.md
food-justice/noa tops library concept in milan with organic roof ring + blossoming park.md
international-solidarity/Review Revolution as Merchandise - Unfinished Business-The Politics of Class War - a British road to.md
labor/A-E-I-O-U Agitate, Educate, Inoculate, Organize, Union  pUsh (from Wages So Low You'll Freak by Mike.md
labor/AFL-CIO Backs Dakota Access Pipeline and the "Family Supporting Jobs" It Provides.md
labor/Green Union Organizing Avoiding the Jobs versus Environment Trap.md
labor/Green Unionism Done Right in Richmond A Brief Review of the Roadmap to Contra Costa County Refinery.md
labor/On fundamentalism in the IWW.md
labor/base-unions-in-italy-to-strike-against-destructive-good-schools-law.md
organizing/Class Power can Remake Society Remembering Australia's Green Ban" Movement.md
organizing/Interview with the organizing team of Utopia Libertaria.md
organizing/Teleseminar Transcript Just Transition with Mateo Nube of Movement Generation.md
technology-digital-justice/AI_Parasocial_Relationships.md
technology-digital-justice/Against the conceptual dumbing down of the 2016 "movement" in France - Mouvement CommunisteKolektivn.md
technology-digital-justice/Arise! Ukrainian comrades on anti-war direct actions in Russia (and its 9th review).md
technology-digital-justice/Did $200,000 Bail Keep Pipeline Activist Out of Sunoco's Way.md
technology-digital-justice/F.L.O.W.E.R. on Opposing "Rock Stone Mountain" 2019 + Black Flags Over Brooklyn with Kim Kelly _ The Final Straw Radio Podcast.md
technology-digital-justice/Greetings from Ukraine We need to think together about self-defence and security.md
technology-digital-justice/Humanness in the Age of AI.md
technology-digital-justice/If Gezi never happened, the anger at mass murder at Soma could not have burst forth from the people.md
technology-digital-justice/Internet & Ideology.md
technology-digital-justice/Situating the blurred trail of the Cangaceiros on the social pampas.md
technology-digital-justice/What Games Are_ Patreonomics And _Supposed To Be_ _ TechCrunch.md
technology-digital-justice/aqotp yes, I do mean "algorithmically-elected official.".md
technology-digital-justice/"Give me my job back, say sorry, and don't do it again" – Interview with a worker sacked for being t.md
theory/2306.17156.md
theory/Abraham Guillén, 'The military error of the Left'.md
theory/Eleven blind leaders or practical socialism and revolutionary tactics from an I.W.W.standpoint – B.H.md
theory/Homeschooling_ Indoctrination or Liberation.md
theory/How To Build International Solidarity.md
theory/How the African Diaspora Resisted Colonialism.md`.split('\n').filter(f => f.trim());

function cleanTitle(title) {
  return title
    // Remove markdown bold
    .replace(/\*\*/g, '')
    // Remove markdown headers
    .replace(/^#+\s*/g, '')
    // Remove escaped characters
    .replace(/\\([*()[\]])/g, '$1')
    // Remove markdown links - keep just the text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove image references
    .replace(/!\[\]\([^)]+\)/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Trim
    .trim()
    // Limit length
    .substring(0, 200);
}

function extractTitleFromFilename(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fixFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if file starts with frontmatter
  if (!content.startsWith('---')) {
    console.log(`  No frontmatter found, adding basic frontmatter`);
    const filename = path.basename(filePath);
    const title = extractTitleFromFilename(filename);
    const category = path.basename(path.dirname(filePath));
    const newContent = `---
title: "${title}"
category: "${category}"
---

${content}`;
    fs.writeFileSync(filePath, newContent);
    return true;
  }

  // Find the end of frontmatter
  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    console.log(`  Malformed frontmatter (no closing ---)`);
    return false;
  }

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3);

  // Extract existing fields
  const lines = frontmatter.split('\n');
  let title = null;
  let category = null;
  let author = null;
  let date = null;
  let otherFields = [];

  for (const line of lines) {
    const titleMatch = line.match(/^title:\s*["']?(.+?)["']?\s*$/);
    const categoryMatch = line.match(/^category:\s*["']?(.+?)["']?\s*$/);
    const authorMatch = line.match(/^author:\s*["']?(.+?)["']?\s*$/);
    const dateMatch = line.match(/^date:\s*["']?(.+?)["']?\s*$/);

    if (titleMatch) {
      title = titleMatch[1];
    } else if (categoryMatch) {
      category = categoryMatch[1];
    } else if (authorMatch) {
      author = authorMatch[1];
    } else if (dateMatch) {
      date = dateMatch[1];
    } else if (line.trim() && !line.startsWith('#')) {
      otherFields.push(line);
    }
  }

  // Clean the title
  if (title) {
    title = cleanTitle(title);
  }

  // If title is still problematic or empty, derive from filename
  if (!title || title.length < 3) {
    title = extractTitleFromFilename(path.basename(filePath));
  }

  // Ensure category exists
  if (!category) {
    category = path.basename(path.dirname(filePath));
  }

  // Escape quotes in title for YAML
  title = title.replace(/"/g, '\\"');

  // Rebuild frontmatter
  let newFrontmatter = `---
title: "${title}"
category: "${category}"`;

  if (author) {
    newFrontmatter += `\nauthor: "${author.replace(/"/g, '\\"')}"`;
  }
  if (date) {
    newFrontmatter += `\ndate: "${date.replace(/"/g, '\\"')}"`;
  }

  newFrontmatter += '\n---';

  const newContent = newFrontmatter + body;
  fs.writeFileSync(filePath, newContent);
  return true;
}

console.log('=== FIXING INVALID FRONTMATTER ===');
console.log(`Files to fix: ${invalidFiles.length}\n`);

let fixed = 0;
let failed = 0;
let notFound = 0;

for (const relativePath of invalidFiles) {
  const fullPath = path.join(DOCS_DIR, relativePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Not found: ${relativePath}`);
    notFound++;
    continue;
  }

  console.log(`Fixing: ${relativePath}`);
  try {
    if (fixFrontmatter(fullPath)) {
      console.log(`  ✓ Fixed`);
      fixed++;
    } else {
      console.log(`  ✗ Could not fix`);
      failed++;
    }
  } catch (err) {
    console.log(`  ✗ Error: ${err.message}`);
    failed++;
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Fixed: ${fixed}`);
console.log(`Failed: ${failed}`);
console.log(`Not found: ${notFound}`);
