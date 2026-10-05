import re
import json

with open('extracted_text.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

patterns = [
    (1, r'1 Write a program to implement stack', 'Stack Implementation (Push, Pop, Show)', 'Stacks & Queues', 'O(1) Push/Pop', 'O(MAX)'),
    (2, r'2\.w\s*rite a program to sort the given elements using Quick Sort', 'Quick Sort Algorithm', 'Sorting', 'O(n log n) avg, O(n²) worst', 'O(log n)'),
    (3, r'3\.\s*Write a program to implement simple queue', 'Simple Queue (Insert, Delete, Show)', 'Stacks & Queues', 'O(1) Insert/Delete', 'O(MAX)'),
    (4, r'4\.\s*Merge Sort', 'Merge Sort Algorithm', 'Sorting', 'O(n log n)', 'O(n)'),
    (5, r'5\.\s*Infix to Postfix', 'Infix to Postfix Conversion', 'Expressions', 'O(n)', 'O(n)'),
    (6, r'6\.\s*Bubble Sort', 'Bubble Sort Algorithm', 'Sorting', 'O(n²)', 'O(1)'),
    (7, r'7\.\s*Polish Notation', 'Prefix Expression Evaluation', 'Expressions', 'O(n)', 'O(n)'),
    (8, r'8\.\s*Write a program to sort the given elements using Insertion Sort', 'Insertion Sort Algorithm', 'Sorting', 'O(n²)', 'O(1)'),
    (9, r'9\.\s*Tower of Hanoi', 'Tower of Hanoi Problem', 'Recursion', 'O(2ⁿ)', 'O(n)'),
    (10, r'10\s*Write a program to sort the given elements using Selection Sort', 'Selection Sort Algorithm', 'Sorting', 'O(n²)', 'O(1)'),
    (11, r'11\s*rite a program to search the element in given array using linear search', 'Linear Search Algorithm', 'Searching', 'O(n)', 'O(1)'),
    (12, r'12\.\s*DFS Graph Traversal', 'Depth First Search (DFS)', 'Graphs', 'O(V²)', 'O(V)'),
    (13, r'13\.\s*Write a program to search the element in given array using Binary search', 'Binary Search Algorithm', 'Searching', 'O(log n)', 'O(1)'),
    (14, r'14\.\s*BFS Graph Traversal', 'Breadth First Search (BFS)', 'Graphs', 'O(V²)', 'O(V)'),
    (15, r'15\.\s*Write a program to implement circular queue', 'Circular Queue (Insert, Delete, Show)', 'Stacks & Queues', 'O(1)', 'O(MAX)'),
    (16, r'16\.\s*2\.\s*Write a program to find minimum spanning tree using prims', "Prim's Minimum Spanning Tree (MST)", 'Graphs', 'O(V²)', 'O(V)'),
    (17, r'17\.\s*Write a program to implement single link list', 'Singly Linked List (Insert, Delete, Show)', 'Linked Lists', 'O(n) Insert, O(1) Del', 'O(n)'),
    (18, r'18\.\s*Doubly Linked List', 'Doubly Linked List (Insert, Delete, Show)', 'Linked Lists', 'O(n) Insert, O(1) Del', 'O(n)'),
    (19, r'19\.\s*Write a program to implement Binary search tree', 'Binary Search Tree (Create, Delete, Show)', 'Trees', 'O(log n) avg, O(n) worst', 'O(h)'),
    (20, r'20\.\s*BST Tree Traversals', 'BST Traversals (Inorder, Preorder, Postorder)', 'Trees', 'O(n)', 'O(h)'),
    (21, r'21\.\s*Array', 'Array Operations (Insert, Delete, Display)', 'Arrays', 'O(n) Insert/Delete', 'O(MAX)'),
    (22, r'22\.\s*Radix Sort', 'Radix Sort Algorithm', 'Sorting', 'O(d · (n + k))', 'O(n + k)')
]

matches = []
for item in patterns:
    m = re.search(item[1], text)
    if not m:
        print(f"FAILED TO MATCH: {item}")
    matches.append({
        'id': item[0],
        'title': item[2],
        'category': item[3],
        'timeComplexity': item[4],
        'spaceComplexity': item[5],
        'pos': m.start() if m else -1
    })

programs_data = []

def format_cpp(raw_code):
    # Basic indentation formatting for Turbo C++ code
    lines = [l.strip() for l in raw_code.split('\n') if l.strip()]
    formatted = []
    indent = 0
    for l in lines:
        if l.startswith('}'):
            indent = max(0, indent - 1)
        formatted.append(('    ' * indent) + l)
        if l.endswith('{') or (l.startswith('{') and not l.endswith('}')):
            indent += 1
    return '\n'.join(formatted)

for i in range(len(matches)):
    start_pos = matches[i]['pos']
    end_pos = matches[i+1]['pos'] if i + 1 < len(matches) else len(text)
    section_text = text[start_pos:end_pos]
    
    # Strip footer
    section_text = re.sub(r'DS Practical\s*[\x96\u2013-]?\s*Turbo C\+\+\s*\|?', '', section_text)
    
    lines = [l.strip() for l in section_text.strip().split('\n') if l.strip()]
    
    code_start_idx = -1
    for idx, line in enumerate(lines):
        if line.startswith('#include') or line.startswith('struct ') or line.startswith('int a[') or line.startswith('int stack[') or line.startswith('int q['):
            code_start_idx = idx
            break
            
    if code_start_idx == -1:
        # fallback search for main or funcs
        for idx, line in enumerate(lines):
            if 'void ' in line or 'int ' in line or 'node' in line:
                code_start_idx = idx
                break

    aim_lines = lines[:code_start_idx]
    aim = ' '.join(aim_lines).replace('Turbo C++ Program', '').strip()
    # clean leading numbers from aim
    aim = re.sub(r'^\d+[\.\s]+', '', aim)
    aim = re.sub(r'^w\s*rite', 'Write', aim, flags=re.IGNORECASE)
    aim = re.sub(r'^rite', 'Write', aim, flags=re.IGNORECASE)
    
    raw_code = '\n'.join(lines[code_start_idx:])
    
    programs_data.append({
        'id': matches[i]['id'],
        'number': matches[i]['id'],
        'title': matches[i]['title'],
        'category': matches[i]['category'],
        'timeComplexity': matches[i]['timeComplexity'],
        'spaceComplexity': matches[i]['spaceComplexity'],
        'aim': aim if aim else matches[i]['title'],
        'code': format_cpp(raw_code)
    })

print(f"Processed {len(programs_data)} programs successfully.")

with open('programs_extracted.json', 'w', encoding='utf-8') as out:
    json.dump(programs_data, out, indent=2)
