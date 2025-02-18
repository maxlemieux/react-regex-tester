const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API endpoint to test Go regex
app.post('/api/test-regex', async (req, res) => {
  const { pattern, text, matchType } = req.body;
  
  // Create temporary Go file
  const tempGoFile = path.join(__dirname, 'temp_regex_runner.go');
  const goCode = `
package main

import (
	"encoding/json"
	"fmt"
	"regexp"
)

type Result struct {
	Matches   bool     \`json:"matches"\`
	AllMatches []string \`json:"allMatches"\`
	SubMatches [][]string \`json:"subMatches"\`
}

func main() {
	pattern := \`${pattern.replace(/`/g, '\\`')}\`
	text := \`${text.replace(/`/g, '\\`')}\`
	matchType := "${matchType}"
	
	re, err := regexp.Compile(pattern)
	if err != nil {
		errorJson, _ := json.Marshal(map[string]string{"error": err.Error()})
		fmt.Println(string(errorJson))
		return
	}
	
	result := Result{
		Matches: re.MatchString(text),
		AllMatches: re.FindAllString(text, -1),
	}
	
	// Get submatches if any
	if matchType == "findSubmatch" {
		submatch := re.FindStringSubmatch(text)
		if len(submatch) > 0 {
			result.SubMatches = [][]string{submatch}
		}
	} else if matchType == "findAllSubmatch" {
		result.SubMatches = re.FindAllStringSubmatch(text, -1)
	}
	
	resultJson, _ := json.Marshal(result)
	fmt.Println(string(resultJson))
}
`;

  try {
    // Write Go file
    await fs.writeFile(tempGoFile, goCode);
    
    // Execute Go file
    exec(`go run ${tempGoFile}`, (error, stdout, stderr) => {
      // Clean up temp file
      fs.unlink(tempGoFile).catch(err => console.error('Error deleting temp file:', err));
      
      if (error) {
        try {
          // Try to parse error as JSON from Go
          const errorObj = JSON.parse(stdout);
          if (errorObj.error) {
            return res.status(400).json({ error: errorObj.error });
          }
        } catch {
          // If parsing fails, return the raw error
          return res.status(500).json({ 
            error: error.message,
            stderr: stderr
          });
        }
      }
      
      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseError) {
        res.status(500).json({ 
          error: 'Failed to parse Go output',
          stdout: stdout
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback
// Then replace the SPA fallback route with:
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  // In development, don't try to serve the SPA fallback
  app.get('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

