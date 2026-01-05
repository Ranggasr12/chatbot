import os

def setup_project_directories():
    """Create all necessary directories for the project"""
    directories = [
        'logs',
        'models',
        'models/processed',
        'models/trained',
        'reports',
        'reports/plots',
        'reports/metrics',
        'scripts',
        'api/chat',
        'api/train',
        'app/api/chat',
        'static',
        'styles',
        'components'
    ]
    
    print("📁 Creating project directories...")
    
    for directory in directories:
        try:
            os.makedirs(directory, exist_ok=True)
            print(f"   ✅ {directory}/")
        except Exception as e:
            print(f"   ❌ Failed to create {directory}: {e}")
    
    print("\n✅ All directories created successfully!")
    
    # Create empty files jika diperlukan
    required_files = [
        'models/intents.json',
        'requirements.txt',
        'README.md'
    ]
    
    print("\n📄 Creating required files...")
    for file in required_files:
        if not os.path.exists(file):
            try:
                with open(file, 'w') as f:
                    if file == 'requirements.txt':
                        f.write("flask\nflask-cors\nscikit-learn\nnumpy\npandas\nnltk\njoblib\n")
                    elif file == 'README.md':
                        f.write("# Chatbot Akademik\n\nChatbot untuk layanan akademik kampus.\n")
                print(f"   ✅ {file}")
            except:
                print(f"   ❌ {file}")
    
    print("\n🎉 Project setup complete!")

if __name__ == "__main__":
    setup_project_directories()