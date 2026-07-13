const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(__dirname, 'src', 'data', 'problems');
const OUTPUT_FILE = path.join(__dirname, 'curated_problems.json');

// Define our mapping blueprints
const blueprint = [
  {
    role: "Data Engineer",
    description: "Master data pipelines, engineering practices, and analytics infrastructure.",
    skills: [
      {
        skill_name: "Python Programming",
        prefix: "py",
        levels: [
          {
            level_name: "Basic",
            questionIds: [412, 9, 231, 258] // Fizz Buzz, Palindrome Number, Power of Two, Add Digits
          },
          {
            level_name: "Easy",
            questionIds: [1, 20, 136, 283] // Two Sum, Valid Parentheses, Single Number, Move Zeroes
          },
          {
            level_name: "Medium",
            questionIds: [2, 3, 15, 49] // Add Two Numbers, Longest Substring, 3Sum, Group Anagrams
          },
          {
            level_name: "Hard",
            questionIds: [4, 23, 42, 76] // Median of Two Sorted Arrays, Merge k Sorted Lists, Trapping Rain Water, Min Window Substring
          }
        ]
      },
      {
        skill_name: "SQL & Databases",
        prefix: "sql",
        levels: [
          {
            level_name: "Basic",
            questionIds: [595, 175, 627, 620] // Big Countries, Combine Two Tables, Swap Salary, Not Boring Movies
          },
          {
            level_name: "Easy",
            questionIds: [181, 182, 183, 197] // Employees Earning More, Duplicate Emails, Customers Who Never Order, Rising Temperature
          },
          {
            level_name: "Medium",
            questionIds: [176, 177, 178, 180] // Second Highest Salary, Nth Highest Salary, Rank Scores, Consecutive Numbers
          },
          {
            level_name: "Hard",
            questionIds: [185, 262, 601] // Department Top Three Salaries, Trips and Users, Human Traffic of Stadium (exactly 3 premier questions)
          }
        ]
      }
    ]
  },
  {
    role: "Full Stack Developer",
    description: "Build robust, responsive, and interactive user interfaces and backend systems.",
    skills: [
      {
        skill_name: "JavaScript/TypeScript Basics",
        prefix: "js",
        levels: [
          {
            level_name: "Basic",
            questionIds: [412, 344, 9, 709] // Fizz Buzz, Reverse String, Palindrome Number, To Lower Case
          },
          {
            level_name: "Easy",
            questionIds: [1, 20, 125, 121] // Two Sum, Valid Parentheses, Valid Palindrome, Best Time to Buy and Sell Stock
          },
          {
            level_name: "Medium",
            questionIds: [3, 15, 49, 11] // Longest Substring, 3Sum, Group Anagrams, Container with most water
          },
          {
            level_name: "Hard",
            questionIds: [4, 72, 42, 76] // Median of Two Sorted, Edit Distance, Trapping Rain Water, Min Window Substring
          }
        ]
      },
      {
        skill_name: "Data Structures & Algorithms (Arrays/Strings)",
        prefix: "dsa",
        levels: [
          {
            level_name: "Basic",
            questionIds: [344, 412, 58, 709] // Reverse String, Fizz Buzz, Length of Last Word, To Lower Case
          },
          {
            level_name: "Easy",
            questionIds: [1, 125, 283, 217] // Two Sum, Valid Palindrome, Move Zeroes, Contains Duplicate
          },
          {
            level_name: "Medium",
            questionIds: [3, 15, 49, 5] // Longest Substring, 3Sum, Group Anagrams, Longest Palindromic Substring
          },
          {
            level_name: "Hard",
            questionIds: [4, 42, 76, 44] // Median of Two Sorted, Trapping Rain Water, Min Window Substring, Wildcard Matching
          }
        ]
      }
    ]
  }
];

function zeroPad(id) {
  return String(id).padStart(4, '0');
}

// Locate file for a problem id
function getProblemFilePath(id) {
  const prefix = zeroPad(id) + '-';
  const files = fs.readdirSync(PROBLEMS_DIR);
  const matched = files.find(f => f.startsWith(prefix) && f.endsWith('.json'));
  if (!matched) {
    throw new Error(`Problem JSON file not found for ID: ${id}`);
  }
  return path.join(PROBLEMS_DIR, matched);
}

// Format and clean up descriptions
function cleanAndFormatDescription(jsonData) {
  let rawDesc = (jsonData.description || '').trim();

  // Strip trailing "Example 1:", "Example 2:", "Constraints:" if they are at the end without info
  let cleanedDesc = rawDesc
    .replace(/(?:Example\s+\d+:?\s*)+$/gi, '')
    .replace(/Constraints:\s*$/gi, '')
    .replace(/Example 1:\s*$/gi, '')
    .replace(/Example 2:\s*$/gi, '')
    .replace(/Example 3:\s*$/gi, '')
    .trim();

  let desc = cleanedDesc;

  // Add nicely formatted examples from the structured examples list
  if (jsonData.examples && jsonData.examples.length > 0) {
    desc += '\n\n';
    jsonData.examples.forEach(ex => {
      desc += `**Example ${ex.example_num || ''}:**\n`;
      if (ex.example_text) {
        desc += `\`\`\`\n${ex.example_text.trim()}\n\`\`\`\n\n`;
      }
    });
  }

  // Add nicely formatted constraints from constraints list
  if (jsonData.constraints && jsonData.constraints.length > 0) {
    desc += '\n**Constraints:**\n' + jsonData.constraints.map(c => `- \`${c}\``).join('\n');
  }

  return desc.trim();
}

// Select appropriate starter code based on skill requirements
function getStarterCode(jsonData, skillName) {
  const snippets = jsonData.code_snippets || {};

  if (skillName === "Python Programming") {
    return snippets.python3 || snippets.python || "# Starter code not available";
  } else if (skillName === "SQL & Databases") {
    return snippets.mysql || snippets.postgresql || snippets.mssql || snippets.oraclesql || "-- Write your SQL query here";
  } else if (skillName === "JavaScript/TypeScript Basics" || skillName === "Data Structures & Algorithms (Arrays/Strings)") {
    return snippets.javascript || snippets.typescript || "// Starter code not available";
  }

  return "// Starter code not available";
}

function processCuration() {
  console.log('Starting data curation and transformation...');
  
  const finalOutput = [];

  for (const roleConfig of blueprint) {
    const roleObj = {
      role: roleConfig.role,
      description: roleConfig.description,
      skills: []
    };

    for (const skillConfig of roleConfig.skills) {
      const skillObj = {
        skill_name: skillConfig.skill_name,
        levels: []
      };

      for (const levelConfig of skillConfig.levels) {
        const levelObj = {
          level_name: levelConfig.level_name,
          questions: []
        };

        levelConfig.questionIds.forEach((qId, idx) => {
          const filePath = getProblemFilePath(qId);
          const rawContent = fs.readFileSync(filePath, 'utf-8');
          const jsonData = JSON.parse(rawContent);

          // Build a custom short ID like 'py-b-01'
          const levelLetter = levelConfig.level_name.charAt(0).toLowerCase();
          const customId = `${skillConfig.prefix}-${levelLetter}-${String(idx + 1).padStart(2, '0')}`;

          const questionObj = {
            id: customId,
            title: jsonData.title,
            description: cleanAndFormatDescription(jsonData),
            starter_code: getStarterCode(jsonData, skillConfig.skill_name)
          };

          levelObj.questions.push(questionObj);
        });

        skillObj.levels.push(levelObj);
      }

      roleObj.skills.push(skillObj);
    }

    finalOutput.push(roleObj);
  }

  // Validate the output schema
  validateSchema(finalOutput);

  // Write to final file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalOutput, null, 2), 'utf-8');
  console.log(`Success! Structured curated problems saved to: ${OUTPUT_FILE}`);
}

function validateSchema(data) {
  if (!Array.isArray(data) || data.length < 2) {
    throw new Error("Validation Failed: Output must contain at least 2 roles.");
  }

  data.forEach(role => {
    if (!role.role || !role.description || !Array.isArray(role.skills)) {
      throw new Error(`Validation Failed: Role object lacks required keys: ${JSON.stringify(role)}`);
    }
    
    role.skills.forEach(skill => {
      if (!skill.skill_name || !Array.isArray(skill.levels)) {
        throw new Error(`Validation Failed: Skill object lacks required keys: ${JSON.stringify(skill)}`);
      }

      skill.levels.forEach(level => {
        if (!level.level_name || !Array.isArray(level.questions)) {
          throw new Error(`Validation Failed: Level object lacks required keys: ${JSON.stringify(level)}`);
        }

        if (level.questions.length < 3 || level.questions.length > 4) {
          throw new Error(`Validation Failed: Level ${level.level_name} in Skill ${skill.skill_name} has ${level.questions.length} questions, expected exactly 3-4.`);
        }

        level.questions.forEach(q => {
          if (!q.id || !q.title || !q.description || !q.starter_code) {
            throw new Error(`Validation Failed: Question object lacks required keys: ${JSON.stringify(q)}`);
          }
        });
      });
    });
  });
  console.log("Validation complete. Schema format, requirements, and counts check passed perfectly!");
}

try {
  processCuration();
} catch (error) {
  console.error("Processing or validation failed:", error.message);
  process.exit(1);
}
