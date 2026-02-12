export default function Footer() {
    return (
      <footer className="bg-[#111] text-white py-16 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
             <h2 className="text-4xl font-serif italic">Saudi</h2>
             <p className="text-sm">Welcome to Arabia</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">About</h4>
            <ul className="space-y-2 opacity-70 text-sm">
              <li>About us</li>
              <li>Features</li>
              <li>News & Blogs</li>
            </ul>
          </div>
  
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 opacity-70 text-sm">
              <li>Instagram</li>
              <li>Twitter</li>
              <li>Facebook</li>
            </ul>
          </div>
  
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 opacity-70 text-sm">
              <li>FAQs</li>
              <li>Support Centre</li>
              <li>Feedback</li>
            </ul>
          </div>
        </div>
      </footer>
    );
  }