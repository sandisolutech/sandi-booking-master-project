"use client"

import { useState } from "react"
import { TagInput } from "@/components/ui/tag-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function TagInputDemo() {
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript"])
  const [hobbies, setHobbies] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>(["English"])

  const skillSuggestions = [
    "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js", 
    "Python", "Java", "C++", "Go", "Rust", "PHP", "Ruby", "Swift",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "SASS", "Less"
  ]

  const hobbySuggestions = [
    "Reading", "Writing", "Photography", "Gaming", "Cooking", "Traveling",
    "Music", "Sports", "Art", "Dancing", "Hiking", "Swimming", "Cycling",
    "Gardening", "Fishing", "Painting", "Drawing", "Singing"
  ]

  const languageSuggestions = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese",
    "Chinese", "Japanese", "Korean", "Russian", "Arabic", "Hindi",
    "Dutch", "Swedish", "Norwegian", "Finnish"
  ]

  const handleReset = () => {
    setSkills(["React", "TypeScript"])
    setHobbies([])
    setLanguages(["English"])
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tag Input Demo</h1>
        <p className="text-muted-foreground">
          Interactive demonstration of the TagInput component with suggestions and multi-selection.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Skills Example */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Skills</CardTitle>
            <CardDescription>
              Add your programming languages and frameworks. Try typing to see suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="skills">Skills</Label>
              <TagInput
                value={skills}
                onChange={setSkills}
                suggestions={skillSuggestions}
                placeholder="Type a skill and press Enter..."
                className="mt-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Selected: {skills.length} skill{skills.length !== 1 ? 's' : ''}
              {skills.length > 0 && (
                <div className="mt-1">
                  {skills.join(", ")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hobbies Example */}
        <Card>
          <CardHeader>
            <CardTitle>Hobbies & Interests</CardTitle>
            <CardDescription>
              What do you enjoy doing in your free time? You can select from suggestions or add custom ones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hobbies">Hobbies</Label>
              <TagInput
                value={hobbies}
                onChange={setHobbies}
                suggestions={hobbySuggestions}
                placeholder="Add your hobbies..."
                className="mt-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Selected: {hobbies.length} hobbies
              {hobbies.length > 0 && (
                <div className="mt-1">
                  {hobbies.join(", ")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Languages Example */}
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>
              Which languages do you speak? Start typing to see suggestions or add your own.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="languages">Languages</Label>
              <TagInput
                value={languages}
                onChange={setLanguages}
                suggestions={languageSuggestions}
                placeholder="Add languages you speak..."
                className="mt-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Selected: {languages.length} language{languages.length !== 1 ? 's' : ''}
              {languages.length > 0 && (
                <div className="mt-1">
                  {languages.join(", ")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
            <CardDescription>
              Reset the demo to see the default values.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleReset} variant="outline">
              Reset Demo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* How to Use */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
          <CardDescription>
            Here's how the TagInput component works:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>Type and Enter:</strong> Type text and press Enter to add a tag</li>
            <li><strong>Suggestions:</strong> Click on suggestions below the input to add them quickly</li>
            <li><strong>Remove Tags:</strong> Click the X button on any tag to remove it</li>
            <li><strong>Backspace:</strong> Press Backspace when input is empty to remove the last tag</li>
            <li><strong>Custom Tags:</strong> Add custom tags not in the suggestions list</li>
            <li><strong>Duplicate Prevention:</strong> Same tags can't be added twice</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
