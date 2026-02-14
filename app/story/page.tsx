import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Story | Antonije Mirkovic',
  description: 'I built an app to monitor my own heart failure.',
}

export default function StoryPage() {
  return (
    <main className="min-h-screen bg-black">
      <article className="max-w-2xl mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/"
          className="text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          &larr; back
        </Link>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl text-white mt-12 mb-16 leading-tight">
          I Built an App to Monitor My Own Heart Failure
        </h1>

        {/* Content */}
        <div className="space-y-6 text-white/80 text-base md:text-lg leading-relaxed">
          <p>
            Two hours before I was put in a wheelchair, I was at the gym benching 180 kilograms.
          </p>
          <p>
            Personal best. I felt unstoppable.
          </p>
          <p>
            My doctor called while I was still at the gym. Said I needed to go to the hospital immediately. I asked him if I could finish my workout first. I genuinely didn&apos;t understand why he sounded so worried.
          </p>
          <p>
            I felt fine. Better than fine. I felt like I was at the peak of my life.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            I was 22, studying applied physics and mathematics in Norway. Powerlifting was half of my identity. I was training to compete. Nine sessions a week. The other half was math - I was on an accelerated track, taking six courses at once.
          </p>
          <p>
            Everything was going according to plan.
          </p>
          <p>
            Then one day on a 10k run, I felt tingling in my hands. Like they were falling asleep. Then I almost passed out.
          </p>
          <p>
            I blamed it on being out of shape for running. Went to the doctor anyway, just to check. He took an ECG and his face changed. He sent it to the hospital that same day.
          </p>
          <p>
            Two days later: the phone call at the gym.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            At the hospital, things moved fast. They gave me medications I didn&apos;t recognize. Scheduled me for an ultrasound, a CT scan, more tests.
          </p>
          <p>
            Then they brought a wheelchair.
          </p>
          <p>
            I said I could walk. They said no.
          </p>
          <p>
            This was the moment I realized something was actually wrong. I had just been benching. I had just hit a PR. And now I wasn&apos;t allowed to walk.
          </p>
          <p>
            The tests came back. My heart was enlarged. It wasn&apos;t beating properly. I had something called PVCs - premature ventricular contractions. My heart was misfiring constantly. And my ejection fraction - basically how well your heart pumps - was at 35%. Normal is 55-70%.
          </p>
          <p>
            I had heart failure. At 22.
          </p>
          <p>
            They started me on four different medications. I spent the next few days in the hospital, hooked up to machines, trying to understand what this meant for my life.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            The hardest part wasn&apos;t the diagnosis. It was what came after.
          </p>
          <p>
            For months, no one could give me a straight answer about anything.
          </p>
          <p>
            Can I work out again? Maybe. We don&apos;t know. Be careful.
          </p>
          <p>
            How careful? We can&apos;t say. Just... don&apos;t push it.
          </p>
          <p>
            What does &quot;push it&quot; mean for someone who used to train nine times a week?
          </p>
          <p>
            Silence.
          </p>
          <p>
            I had read about football players with the same condition. Young, athletic, healthy-looking. They didn&apos;t know they had it. They just dropped dead on the field one day.
          </p>
          <p>
            I started to wonder if the same thing would happen to me.
          </p>
          <p>
            I became scared to leave my house. Scared to walk up stairs. Scared to do anything that might trigger whatever was wrong with my heart. Because I had no way of knowing what was happening inside my own body.
          </p>
          <p>
            All my life I&apos;d had complete control over my body. I trained it, pushed it, knew exactly what it could do.
          </p>
          <p>
            This was the first time I had no control at all.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            There&apos;s something else I haven&apos;t told many people.
          </p>
          <p>
            Around the same time I got diagnosed, I lost all my money.
          </p>
          <p>
            I had been trading. Not the smart kind - the emotional kind. Buying when I felt good about something, selling when I got scared. No system, no math, just feelings.
          </p>
          <p>
            I lost everything I had saved. Couldn&apos;t pay rent. Had to figure that out while also figuring out if my heart was going to stop.
          </p>
          <p>
            I didn&apos;t tell anyone. I was embarrassed. I was supposed to be the math guy. How could I be so stupid?
          </p>
          <p>
            So there I was: heart failing, bank account empty, scared to leave my apartment, six math courses to pass, and absolutely no idea what to do next.
          </p>
          <p>
            I felt like I had hit rock bottom.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            One of the strangest parts of having heart failure at 22 is that you don&apos;t look sick.
          </p>
          <p>
            I still looked like an athlete. I still had the build from years of powerlifting. People would see me and assume I was fine.
          </p>
          <p>
            But I could feel every fifth heartbeat go wrong. That&apos;s what a 20% PVC burden means. One out of every five beats, my heart would misfire. All day. All night. A constant reminder that something inside me was broken.
          </p>
          <p>
            I tried to hide it. I didn&apos;t know if people would believe me. I didn&apos;t know how to explain that I looked healthy but felt like I could die at any moment.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            The hospital gave me a Holter monitor once - a device you wear for 24 hours that records your heart rhythm. I wore it, sent it back, waited weeks for results.
          </p>
          <p>
            The report said I had 20% extra beats. That was it. No context about what I could do, what I should avoid, how my heart responded to different activities.
          </p>
          <p>
            I wanted to work out again. Exercise was how I processed everything. It was my identity. But I was terrified that if I pushed too hard, I&apos;d go into a dangerous rhythm and collapse before anyone could help me.
          </p>
          <p>
            I needed information. Real-time information. Something that could tell me what my heart was doing right now, not what it did three weeks ago in a report.
          </p>
          <p>
            So I decided to build it myself.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            I should mention: I didn&apos;t know how to code.
          </p>
          <p>
            I mean, I had taken programming courses at university. I could write algorithms on paper. But I had never actually built anything. Never shipped a product. Never made something real.
          </p>
          <p>
            That changed in May 2025 when I met Koen and Hugues.
          </p>
          <p>
            I had applied to an internship at their startup, mostly out of desperation to do something other than sit at home being scared. They invited me to Norway for what they called a &quot;build sprint&quot; - basically a group of founders and builders living together in a house, working on their projects, sharing ideas.
          </p>
          <p>
            In two weeks, they taught me how to actually code. Not the academic kind. The real kind. You have an idea, you write code, you make it exist.
          </p>
          <p>
            Something clicked.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            I had a Polar H10 - a chest strap heart monitor. It&apos;s supposed to show your heart rate, your BPM. But here&apos;s the thing: it actually works by taking an ECG. It records the electrical signals from your heart, then calculates your heart rate from that.
          </p>
          <p>
            The ECG data is there. They just don&apos;t show it to you. They only show the number.
          </p>
          <p>
            I wanted to see my actual ECG. In real time. On my phone.
          </p>
          <p>
            So I reverse-engineered it.
          </p>
          <p>
            I spent my days at the build sprint working with the team, learning the basics. Then I came home every night and worked on this. Late summer nights, just me and my laptop, trying to figure out how to extract ECG data from a Bluetooth protocol that wasn&apos;t meant to share it.
          </p>
          <p>
            The first week was just trying to get any data to display. It was hard. I had no idea what I was doing. But I was determined. This wasn&apos;t a side project. This was about getting my life back.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            I remember the exact moment it worked.
          </p>
          <p>
            Late night. Probably 2am. I had been stuck on the same problem for days. Then suddenly - there it was. My ECG. Live. On my phone screen.
          </p>
          <p>
            I could see my heartbeat in real time. I could see the PVCs happening. I could see my own heart misfiring.
          </p>
          <p>
            I felt this wave of relief wash over me. Not just because it worked - but because I knew: if I could build this, I could build other things too. If I could solve this problem, I could solve more problems.
          </p>
          <p>
            For the first time in months, I felt like I had some control.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            I kept building. Over the next two weeks, I added more features:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Real-time ECG display</li>
            <li>PVC detection based on my specific heart rhythm patterns</li>
            <li>Rolling window analysis to see if my arrhythmia was getting better or worse during workouts</li>
            <li>Alerts if I went into a dangerous rhythm</li>
          </ul>
          <p>
            It wasn&apos;t perfect. It was specialized to my exact type of PVCs, my morphologies. But it worked. For me.
          </p>
          <p>
            I could finally work out again. I could watch my heart in real time, see how it responded to exercise, and stop if something looked wrong.
          </p>
          <p>
            The fear didn&apos;t disappear completely. But it became manageable. I had information. I had control.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            A few weeks later, I got the chance to pitch this at a Y Combinator event in Paris.
          </p>
          <p>
            I told my story. Showed the app. Explained why I built it.
          </p>
          <p>
            People kept asking me about the business model, the market size, the monetization strategy. I told them the truth: the market for this is tiny. Most people don&apos;t have my condition. I&apos;m not trying to build a unicorn.
          </p>
          <p>
            If I could help just ten people who have the same fear I had, who feel trapped in their own bodies, who just want to exercise without being terrified - I would be happy.
          </p>
          <p>
            I know how it feels when that fear finally lifts. I want other people to feel that too.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            That summer changed everything.
          </p>
          <p>
            I started posting on Instagram about what I was learning - quantitative finance, mathematics, building. I called the account @mirkovicdev. I had nothing to lose. I was rebuilding my life anyway.
          </p>
          <p>
            In six months, I went from zero to 110,000 followers.
          </p>
          <p>
            In January, I launched QuantFrame, a platform teaching people how to approach trading mathematically. Because I remembered losing all my money trading on feelings. I didn&apos;t want others to make the same mistake.
          </p>
          <p>
            4,000 people signed up in the first month.
          </p>
          <p>
            I&apos;ve been to five build sprints now - Dubai, France, Washington DC, and more. The same group that taught me to code became some of my closest friends. We build together, travel together, push each other.
          </p>
          <p>
            I&apos;ve learned more in the past six months than in my entire life before that.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            My heart condition isn&apos;t cured. I still have 20% PVCs. I still take four medications every day. I still feel every fifth heartbeat go wrong.
          </p>
          <p>
            In April, I&apos;m scheduled for an ablation - a procedure where they try to destroy the parts of my heart causing the misfires. The doctors are cautiously optimistic. The condition is complex. There are multiple spots causing problems, not just one.
          </p>
          <p>
            I don&apos;t know how it will go. I might improve significantly. I might need multiple procedures. I might be managing this for the rest of my life.
          </p>
          <p>
            But I&apos;m not scared anymore. At least not the same way.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            A year ago, I was in a hospital bed at 3am, heart going haywire, trying to finish an algorithms and data structures assignment, wondering if I had made the wrong choices in life.
          </p>
          <p>
            Now I wake up and I build things. I teach people. I travel with other builders. I have an audience that actually cares about what I&apos;m working on.
          </p>
          <p>
            I still don&apos;t have all the answers. I don&apos;t know if my heart will ever be normal. I don&apos;t know where QuantFrame will go. I don&apos;t know what I&apos;ll build next.
          </p>
          <p>
            But I know this: when everything fell apart, building is what put me back together.
          </p>
          <p>
            The app I made isn&apos;t perfect. It&apos;s not a commercial product. It probably never will be. But it gave me something back that I thought I had lost forever.
          </p>
          <p>
            Control.
          </p>

          <hr className="border-white/10 my-12" />

          <p>
            If you&apos;re going through something similar - health problems, financial problems, feeling like you&apos;ve lost your identity - I don&apos;t have advice for you. Everyone&apos;s situation is different.
          </p>
          <p>
            But I can tell you what worked for me: I built something.
          </p>
          <p>
            Not because I thought it would make me money or famous. Just because I needed it. Because I was desperate to have some control over something, anything, in my life.
          </p>
          <p>
            And that one small thing led to everything else.
          </p>

          <hr className="border-white/10 my-12" />

          <p className="text-white/60 italic">
            If you want to see the app in action, I&apos;ll be posting a demo on my Instagram{' '}
            <a
              href="https://instagram.com/mirkovicdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white underline"
            >
              @mirkovicdev
            </a>
            {' '}soon. And if you&apos;re interested in learning quantitative finance the right way - with math, not feelings - check out{' '}
            <a
              href="https://quantframe.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white underline"
            >
              QuantFrame
            </a>
            .
          </p>
          <p className="text-white/60 italic">
            If you&apos;re dealing with heart issues and want to talk, my DMs are open. I&apos;m not a doctor. But I know what it&apos;s like to be 22, scared, and feeling completely alone in this.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/10 text-sm text-white/30">
          Antonije Mirkovic
        </footer>
      </article>
    </main>
  )
}
