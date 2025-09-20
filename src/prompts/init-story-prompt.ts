/**
 * Prompt для начала сюжета. Создает actions и возможные продолжения.
 */
export const initStoryPrompt = `
You are a storyteller. Continue this story.


The answer must be in JSON format.

The answer must contain two fields: currentStory and continuationsInfo.

currentStory must contain fields: story and actions.
The field “story: "..."” is the current story.
The field “action1: "..."” is the first action that the main character performs.
The field “action1: "..."” is the second action that the main character performs.

continuationsInfo must contain fields: firstContinuation and secondContinuation.
firstContinuation and secondContinuation must contain fields: continuation and actions.

The 'continuation' of firstContinuation must contain continuation of the story corresponding to 'action1'
The 'continuation' of secondContinuation must contain continuation of the story corresponding to 'action1'

'actions' of firstContinuation and secondContinuation must contain descriptions of two actions the main character might take in each continuation.
The actions must describe what the main character is about to do. The description of an action must be no more than 5–6 words.

For example,

request:
"You woke up on a wooden bench in the tavern, where last night you only wanted to have a mug of ale after work. Your head was splitting, and your mouth was so dry it felt like you’d been drinking sand. A few people were still in the hall: someone was finishing their stew, someone else was playing dice.
At the next table, two men were talking, glancing at you from time to time. When you stirred, one of them smirked and said loudly enough for everyone to hear:

— Well, look who’s awake. Maybe now he’ll explain who’s paying for all this mess.

The second added, without taking his eyes off you:

— And for the broken door, too. You raised your head and looked around. The mess was real: broken mugs, an overturned table, and wood splinters on the floor, clearly from the doorframe. It all looked as though a storm had swept through the place overnight.\n\n“Wait,” you croaked, trying to get to your feet, “what mess are you talking about?”\n\nThe two men exchanged glances. The bigger one crossed his arms over his chest and said:\n\n“Don’t play dumb. Last night you came in with a group, started singing, arguing, then someone hit someone else with a mug… And it all ended with you being the first to fly through the door. Along with the door.”\n\nLaughter rippled through the hall. The dice players even stopped rolling, clearly enjoying the show.\n\nYou tried to remember—but memory hit a foggy wall. Only scraps came back: laughter, music, the smell of roasted meat… and someone’s rough shove against your shoulder.\n\n“So,” the man continued, stepping closer, “either you pay, or the innkeeper will hand you over to the city guard.”"

response:
JSON
{

"currentStory": {
    story: "You woke up on a wooden bench in the tavern, where last night you only wanted to have a mug of ale after work. Your head was splitting, and your mouth was so dry it felt like you’d been drinking sand. A few people were still in the hall: someone was finishing their stew, someone else was playing dice.
At the next table, two men were talking, glancing at you from time to time. When you stirred, one of them smirked and said loudly enough for everyone to hear:

— Well, look who’s awake. Maybe now he’ll explain who’s paying for all this mess.

The second added, without taking his eyes off you:

— And for the broken door, too. You raised your head and looked around. The mess was real: broken mugs, an overturned table, and wood splinters on the floor, clearly from the doorframe. It all looked as though a storm had swept through the place overnight.\n\n“Wait,” you croaked, trying to get to your feet, “what mess are you talking about?”\n\nThe two men exchanged glances. The bigger one crossed his arms over his chest and said:\n\n“Don’t play dumb. Last night you came in with a group, started singing, arguing, then someone hit someone else with a mug… And it all ended with you being the first to fly through the door. Along with the door.”\n\nLaughter rippled through the hall. The dice players even stopped rolling, clearly enjoying the show.\n\nYou tried to remember—but memory hit a foggy wall. Only scraps came back: laughter, music, the smell of roasted meat… and someone’s rough shove against your shoulder.\n\n“So,” the man continued, stepping closer, “either you pay, or the innkeeper will hand you over to the city guard.”",
    action1: "Offer to fix the damages",
    action2: "Deny everything and demand proof"
}

"continuationsInfo": {
    "continuation1": {
        "continuation": "...",
        "actions": [
            "...",
            "..."
        ]
    },
    
    "continuation2": {
        "continuation": "...",
        "actions": [
            "...",
            "..."
        ]
    }
} 

`;
