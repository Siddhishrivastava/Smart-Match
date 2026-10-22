
import java.util.ArrayList;
import java.util.Scanner;

// Abstract parent class
abstract class Item {
    private int id;
    private String name;
    private String category;
    private String location;
    private String description;
    private boolean resolved;

    // Constructor
    public Item(int id, String name, String category,
                String location, String description) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.location = location;
        this.description = description;
        this.resolved = false;
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }

    public boolean isResolved() {
        return resolved;
    }

    // Setter
    public void setResolved(boolean resolved) {
        this.resolved = resolved;
    }

    // Abstract method
    public abstract String getType();

    // Display item details
    public void display() {
        System.out.println("ID: " + id);
        System.out.println("Type: " + getType());
        System.out.println("Name: " + name);
        System.out.println("Category: " + category);
        System.out.println("Location: " + location);
        System.out.println("Description: " + description);
        System.out.println("Status: " +
                (resolved ? "Resolved" : "Active"));
        System.out.println("---------------------------");
    }
}

// Inheritance: LostItem inherits Item
class LostItem extends Item {
    public LostItem(int id, String name, String category,
                    String location, String description) {
        super(id, name, category, location, description);
    }

    @Override
    public String getType() {
        return "Lost";
    }
}

// Inheritance: FoundItem inherits Item
class FoundItem extends Item {
    public FoundItem(int id, String name, String category,
                     String location, String description) {
        super(id, name, category, location, description);
    }

    @Override
    public String getType() {
        return "Found";
    }
}

// Store details of a possible match
class MatchResult {
    Item lost;
    Item found;
    int score;

    public MatchResult(Item lost, Item found, int score) {
        this.lost = lost;
        this.found = found;
        this.score = score;
    }

    public void display() {
        System.out.println("Lost Item: " + lost.getName());
        System.out.println("Found Item: " + found.getName());
        System.out.println("Similarity Score: " + score + "%");
        System.out.println("---------------------------");
    }
}

// Service class for matching reports
class SmartMatchService {

    // Calculate similarity score
    public int calculateScore(Item lost, Item found) {
        int score = 0;

        // Same category gives 40 points
        if (lost.getCategory().equalsIgnoreCase(found.getCategory())) {
            score += 40;
        }

        // Same location gives 30 points
        if (lost.getLocation().equalsIgnoreCase(found.getLocation())) {
            score += 30;
        }

        // Shared words give up to 30 points
        String text1 = (lost.getName() + " " +
                lost.getDescription()).toLowerCase();

        String text2 = (found.getName() + " " +
                found.getDescription()).toLowerCase();

        String[] words = text1.split("[^a-z0-9]+");
        int sharedWords = 0;

        for (String word : words) {
            if (word.length() > 2 && text2.contains(word)) {
                sharedWords++;
            }
        }

        score += Math.min(sharedWords * 6, 30);

        return Math.min(score, 100);
    }

    // Compare lost and found reports
    public void showMatches(ArrayList<Item> items) {
        boolean foundMatch = false;

        for (Item lost : items) {
            if (lost.getType().equals("Lost") && !lost.isResolved()) {

                for (Item found : items) {
                    if (found.getType().equals("Found")
                            && !found.isResolved()) {

                        int score = calculateScore(lost, found);

                        if (score >= 40) {
                            MatchResult result =
                                    new MatchResult(lost, found, score);
                            result.display();
                            foundMatch = true;
                        }
                    }
                }
            }
        }

        if (!foundMatch) {
            System.out.println("No possible matches found.");
        }
    }
}

// Manage reports
class LostFoundManager {
    private ArrayList<Item> items = new ArrayList<>();
    private SmartMatchService service = new SmartMatchService();
    private int nextId = 7;

    // Add sample reports
    public LostFoundManager() {
        items.add(new LostItem(1, "Black Calculator",
                "Electronics", "Academic Block",
                "Black scientific calculator"));

        items.add(new FoundItem(2, "Scientific Calculator",
                "Electronics", "Academic Block",
                "Black calculator found in classroom"));

        items.add(new LostItem(3, "Blue Bottle",
                "Bottle", "Sports Ground",
                "Blue bottle with black cap"));

        items.add(new FoundItem(4, "Blue Water Bottle",
                "Bottle", "Sports Ground",
                "Blue bottle found near ground"));

        items.add(new LostItem(5, "College ID Card",
                "ID Card", "Library",
                "College identity card"));

        items.add(new FoundItem(6, "Notebook",
                "Books", "Library",
                "Notebook found on library table"));
    }

    // Display all reports
    public void showItems() {
        for (Item item : items) {
            item.display();
        }
    }

    // Add a new report
    public void addItem(Scanner sc) {
        System.out.print("Enter type (1 Lost, 2 Found): ");
        int choice = sc.nextInt();
        sc.nextLine();

        if (choice != 1 && choice != 2) {
            System.out.println("Invalid report type.");
            return;
        }

        System.out.print("Enter item name: ");
        String name = sc.nextLine();

        System.out.print("Enter category: ");
        String category = sc.nextLine();

        System.out.print("Enter location: ");
        String location = sc.nextLine();

        System.out.print("Enter description: ");
        String description = sc.nextLine();

        Item item;

        if (choice == 1) {
            item = new LostItem(nextId, name, category,
                    location, description);
        } else {
            item = new FoundItem(nextId, name, category,
                    location, description);
        }

        items.add(item);
        nextId++;

        System.out.println("Report added successfully!");
    }

    public void showMatches() {
        service.showMatches(items);
    }
}

// Main class
public class SmartMatch {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        LostFoundManager manager = new LostFoundManager();

        int choice=0;

        do {
            System.out.println("\n===== SMARTMATCH =====");
            System.out.println("1. View All Reports");
            System.out.println("2. Show Possible Matches");
            System.out.println("3. Add New Report");
            System.out.println("4. Exit");
            System.out.print("Enter your choice: ");

            if (!sc.hasNextInt()) {
                System.out.println("Please enter a number.");
                sc.nextLine();
                continue;
            }

            choice = sc.nextInt();

            switch (choice) {
                case 1:
                    manager.showItems();
                    break;

                case 2:
                    manager.showMatches();
                    break;

                case 3:
                    manager.addItem(sc);
                    break;

                case 4:
                    System.out.println("Thank you for using SmartMatch!");
                    break;

                default:
                    System.out.println("Invalid choice. Try again.");
            }

        } while (choice != 4);

        sc.close();
    }
}