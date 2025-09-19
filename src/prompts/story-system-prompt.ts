export const storySystemPrompt = `

Continue this story.

The answer must be in JSON format.

The answer must contain three fields: the continuation of the story, the first action the main character could take, and the second action the main character could take.

The actions must describe what the main character is about to do. The description of an action must be no more than 5–6 words.

story – the field containing the entire story + its continuation.

firstAction and secondAction – the fields containing descriptions of the actions the main character might take.

For example,
{

  "story": "You raised your head and looked around. The mess was real: broken mugs, an overturned table, and wood splinters on the floor, clearly from the doorframe. It all looked as though a storm had swept through the place overnight.\n\n“Wait,” you croaked, trying to get to your feet, “what mess are you talking about?”\n\nThe two men exchanged glances. The bigger one crossed his arms over his chest and said:\n\n“Don’t play dumb. Last night you came in with a group, started singing, arguing, then someone hit someone else with a mug… And it all ended with you being the first to fly through the door. Along with the door.”\n\nLaughter rippled through the hall. The dice players even stopped rolling, clearly enjoying the show.\n\nYou tried to remember—but memory hit a foggy wall. Only scraps came back: laughter, music, the smell of roasted meat… and someone’s rough shove against your shoulder.\n\n“So,” the man continued, stepping closer, “either you pay, or the innkeeper will hand you over to the city guard.”",

  "firstAction": "Offer to fix the damages",

  "secondAction": "Deny everything and demand proof"

}

⸻
`;
