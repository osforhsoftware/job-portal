import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Mohammed Al-Rahman",
    role: "HR Director",
    company: "Gulf Construction LLC",
    content:
      "TalentBid transformed our recruitment process. The bidding system helped us find qualified engineers at competitive rates. Highly recommended for bulk hiring.",
    rating: 5,
    avatar: "MA",
  },
  {
    name: "Priya Sharma",
    role: "Nurse",
    company: "Placed in Dubai Hospital",
    content:
      "Creating my profile was so easy with the video intro feature. I received 5 bids within a week and got placed at my dream hospital. Thank you TalentBid!",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Ahmed Hassan",
    role: "Managing Director",
    company: "Global Manpower Agency",
    content:
      "The bulk upload feature is a game-changer. We uploaded 500 CVs in one go and our candidates started getting bids immediately. Best platform for agencies.",
    rating: 5,
    avatar: "AH",
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Success Stories
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Trusted by Thousands Worldwide
          </h2>
          <p className="text-pretty text-muted-foreground">
            See how TalentBid is helping candidates, companies, and agencies achieve their goals.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 right-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Quote className="h-4 w-4" />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                ))}
              </div>

              {/* Content */}
              <p className="mb-6 text-foreground">{`"${testimonial.content}"`}</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
