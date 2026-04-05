# GymRat - keep defaults simple for now.
# We are not aggressively shrinking yet because production hardening comes first.

-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-dontwarn com.getcapacitor.**
-dontwarn com.capacitorjs.plugins.**

# RevenueCat / billing safety
-keep class com.revenuecat.** { *; }
-dontwarn com.revenuecat.**