import { useEffect, useMemo, useState } from 'react';
import { Exercise, MuscleGroup } from '@/lib/exerciseData';

// Per-exercise video imports
import chestPressVideo from '@/assets/videos/chest-press.mp4';
import inclinePressVideo from '@/assets/videos/incline-press.mp4';
import chestFlyVideo from '@/assets/videos/chest-fly.mp4';
import pushUpVideo from '@/assets/videos/push-up.mp4';
import cableCrossoverVideo from '@/assets/videos/cable-crossover.mp4';
import chestDipVideo from '@/assets/videos/chest-dip.mp4';
import pecDeckVideo from '@/assets/videos/pec-deck.mp4';
import declinePressVideo from '@/assets/videos/decline-press.mp4';
import landminePressVideo from '@/assets/videos/landmine-press.mp4';

import deadliftVideo from '@/assets/videos/deadlift.mp4';
import backRowVideo from '@/assets/videos/back-row.mp4';
import latPulldownVideo from '@/assets/videos/lat-pulldown.mp4';
import pullUpVideo from '@/assets/videos/pull-up.mp4';
import seatedRowVideo from '@/assets/videos/seated-row.mp4';
import tbarRowVideo from '@/assets/videos/tbar-row.mp4';
import singleArmRowVideo from '@/assets/videos/single-arm-row.mp4';
import hyperextensionVideo from '@/assets/videos/hyperextension.mp4';
import shrugVideo from '@/assets/videos/shrug.mp4';

import shoulderPressVideo from '@/assets/videos/shoulder-press.mp4';
import lateralRaiseVideo from '@/assets/videos/lateral-raise.mp4';
import frontRaiseVideo from '@/assets/videos/front-raise.mp4';
import facePullVideo from '@/assets/videos/face-pull.mp4';
import arnoldPressVideo from '@/assets/videos/arnold-press.mp4';
import uprightRowVideo from '@/assets/videos/upright-row.mp4';
import reverseFlyVideo from '@/assets/videos/reverse-fly.mp4';
import cableLateralRaiseVideo from '@/assets/videos/cable-lateral-raise.mp4';

import legSquatVideo from '@/assets/videos/leg-squat.mp4';
import lungesVideo from '@/assets/videos/lunges.mp4';
import legPressVideo from '@/assets/videos/leg-press.mp4';
import legCurlVideo from '@/assets/videos/leg-curl.mp4';
import calfRaiseVideo from '@/assets/videos/calf-raise.mp4';
import romanianDeadliftVideo from '@/assets/videos/romanian-deadlift.mp4';
import bulgarianSplitSquatVideo from '@/assets/videos/bulgarian-split-squat.mp4';
import hackSquatVideo from '@/assets/videos/hack-squat.mp4';
import legExtensionVideo from '@/assets/videos/leg-extension.mp4';

import armCurlVideo from '@/assets/videos/arm-curl.mp4';
import tricepDipVideo from '@/assets/videos/tricep-dip.mp4';
import hammerCurlVideo from '@/assets/videos/hammer-curl.mp4';
import tricepPushdownVideo from '@/assets/videos/tricep-pushdown.mp4';
import preacherCurlVideo from '@/assets/videos/preacher-curl.mp4';
import concentrationCurlVideo from '@/assets/videos/concentration-curl.mp4';
import overheadTricepVideo from '@/assets/videos/overhead-tricep.mp4';
import cableCurlVideo from '@/assets/videos/cable-curl.mp4';
import skullCrusherVideo from '@/assets/videos/skull-crusher.mp4';

import corePlankVideo from '@/assets/videos/core-plank.mp4';
import cableCrunchVideo from '@/assets/videos/cable-crunch.mp4';
import russianTwistVideo from '@/assets/videos/russian-twist.mp4';
import hangingLegRaiseVideo from '@/assets/videos/hanging-leg-raise.mp4';
import mountainClimberVideo from '@/assets/videos/mountain-climber.mp4';
import deadBugVideo from '@/assets/videos/dead-bug.mp4';
import abWheelVideo from '@/assets/videos/ab-wheel.mp4';
import sidePlankVideo from '@/assets/videos/side-plank.mp4';

import warmupJacksVideo from '@/assets/videos/warmup-jacks.mp4';
import armCirclesVideo from '@/assets/videos/arm-circles.mp4';
import highKneesVideo from '@/assets/videos/high-knees.mp4';
import hipCirclesVideo from '@/assets/videos/hip-circles.mp4';
import legSwingsVideo from '@/assets/videos/leg-swings.mp4';
import buttKicksVideo from '@/assets/videos/butt-kicks.mp4';
import inchwormVideo from '@/assets/videos/inchworm.mp4';
import torsoTwistVideo from '@/assets/videos/torso-twist.mp4';
import ankleCirclesVideo from '@/assets/videos/ankle-circles.mp4';

import stretchingFlowVideo from '@/assets/videos/stretching-flow.mp4';
import hamstringStretchVideo from '@/assets/videos/hamstring-stretch.mp4';
import hipFlexorStretchVideo from '@/assets/videos/hip-flexor-stretch.mp4';
import chestOpenerVideo from '@/assets/videos/chest-opener.mp4';
import catCowVideo from '@/assets/videos/cat-cow.mp4';
import quadStretchVideo from '@/assets/videos/quad-stretch.mp4';
import shoulderStretchVideo from '@/assets/videos/shoulder-stretch.mp4';
import childsPoseVideo from '@/assets/videos/childs-pose.mp4';
import pigeonPoseVideo from '@/assets/videos/pigeon-pose.mp4';

interface ExerciseAnimationProps {
  exercise: Exercise;
  compact?: boolean;
}

const STEP_DURATION_MS = 1800;

const fallbackByMuscleGroup: Record<MuscleGroup, string> = {
  warmup: warmupJacksVideo,
  chest: chestPressVideo,
  back: backRowVideo,
  shoulders: shoulderPressVideo,
  legs: legSquatVideo,
  arms: armCurlVideo,
  core: corePlankVideo,
  stretching: stretchingFlowVideo,
};

const videoByExerciseId: Record<string, string> = {
  // chest
  'bench-press': chestPressVideo,
  'incline-press': inclinePressVideo,
  'chest-fly': chestFlyVideo,
  'push-up': pushUpVideo,
  'cable-crossover': cableCrossoverVideo,
  'chest-dip': chestDipVideo,
  'pec-deck': pecDeckVideo,
  'decline-press': declinePressVideo,
  'landmine-press': landminePressVideo,

  // back
  'deadlift': deadliftVideo,
  'barbell-row': backRowVideo,
  'lat-pulldown': latPulldownVideo,
  'pull-up': pullUpVideo,
  'seated-row': seatedRowVideo,
  'tbar-row': tbarRowVideo,
  'single-arm-row': singleArmRowVideo,
  'hyperextension': hyperextensionVideo,
  'shrug': shrugVideo,

  // shoulders
  'overhead-press': shoulderPressVideo,
  'lateral-raise': lateralRaiseVideo,
  'front-raise': frontRaiseVideo,
  'face-pull': facePullVideo,
  'arnold-press': arnoldPressVideo,
  'upright-row': uprightRowVideo,
  'reverse-fly': reverseFlyVideo,
  'cable-lateral-raise': cableLateralRaiseVideo,

  // legs
  'squat': legSquatVideo,
  'lunges': lungesVideo,
  'leg-press': legPressVideo,
  'leg-curl': legCurlVideo,
  'calf-raise': calfRaiseVideo,
  'romanian-deadlift': romanianDeadliftVideo,
  'bulgarian-split-squat': bulgarianSplitSquatVideo,
  'hack-squat': hackSquatVideo,
  'leg-extension': legExtensionVideo,

  // arms
  'bicep-curl': armCurlVideo,
  'tricep-dip': tricepDipVideo,
  'hammer-curl': hammerCurlVideo,
  'tricep-pushdown': tricepPushdownVideo,
  'preacher-curl': preacherCurlVideo,
  'concentration-curl': concentrationCurlVideo,
  'overhead-tricep': overheadTricepVideo,
  'cable-curl': cableCurlVideo,
  'skull-crusher': skullCrusherVideo,

  // core
  'plank': corePlankVideo,
  'cable-crunch': cableCrunchVideo,
  'russian-twist': russianTwistVideo,
  'hanging-leg-raise': hangingLegRaiseVideo,
  'mountain-climber': mountainClimberVideo,
  'dead-bug': deadBugVideo,
  'ab-wheel': abWheelVideo,
  'side-plank': sidePlankVideo,

  // warm-up
  'arm-circles': armCirclesVideo,
  'jumping-jacks': warmupJacksVideo,
  'high-knees': highKneesVideo,
  'hip-circles': hipCirclesVideo,
  'leg-swings': legSwingsVideo,
  'butt-kicks': buttKicksVideo,
  'inchworm': inchwormVideo,
  'torso-twist': torsoTwistVideo,
  'ankle-circles': ankleCirclesVideo,

  // stretching
  'hamstring-stretch': hamstringStretchVideo,
  'hip-flexor-stretch': hipFlexorStretchVideo,
  'chest-opener-stretch': chestOpenerVideo,
  'cat-cow-stretch': catCowVideo,
  'quad-stretch': quadStretchVideo,
  'shoulder-stretch': shoulderStretchVideo,
  'childs-pose': childsPoseVideo,
  'pigeon-pose': pigeonPoseVideo,
};

const ExerciseAnimation = ({ exercise, compact = false }: ExerciseAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setCurrentStep(0);
    const interval = window.setInterval(() => {
      setCurrentStep(prev => (prev + 1) % exercise.animationSteps.length);
    }, STEP_DURATION_MS);

    return () => window.clearInterval(interval);
  }, [exercise.id, exercise.animationSteps.length]);

  const videoSrc = useMemo(
    () => videoByExerciseId[exercise.id] ?? fallbackByMuscleGroup[exercise.muscleGroup],
    [exercise.id, exercise.muscleGroup]
  );

  if (compact) {
    return (
      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted/40">
        <video
          key={`${exercise.id}-compact`}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square max-w-[220px] mx-auto rounded-xl gradient-card shadow-card overflow-hidden p-3">
      <div className="w-full h-full rounded-lg overflow-hidden border border-border/60">
        <video
          key={exercise.id}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute bottom-3 left-3 right-3 rounded-md bg-card/80 border border-border/50 backdrop-blur-sm px-2.5 py-2">
        <div className="flex gap-1.5 mb-1.5 justify-center">
          {exercise.animationSteps.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === currentStep ? 'bg-primary scale-125' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] text-center text-foreground/90 font-medium leading-snug min-h-[2rem] flex items-center justify-center">
          {exercise.animationSteps[currentStep]}
        </p>
      </div>
    </div>
  );
};

export default ExerciseAnimation;
