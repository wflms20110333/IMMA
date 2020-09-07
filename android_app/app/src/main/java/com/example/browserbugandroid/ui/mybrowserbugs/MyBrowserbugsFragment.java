package com.example.browserbugandroid.ui.mybrowserbugs;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProviders;
import com.example.browserbugandroid.R;

public class MyBrowserbugsFragment extends Fragment {

    private MyBrowserbugsViewModel myBrowserbugsViewModel;

    public View onCreateView(@NonNull LayoutInflater inflater,
            ViewGroup container, Bundle savedInstanceState) {
        myBrowserbugsViewModel =
                ViewModelProviders.of(this).get(MyBrowserbugsViewModel.class);
        View root = inflater.inflate(R.layout.fragment_my_browserbugs, container, false);
        final TextView textView = root.findViewById(R.id.text_my_browserbugs);
        myBrowserbugsViewModel.getText().observe(getViewLifecycleOwner(), new Observer<String>() {
            @Override
            public void onChanged(@Nullable String s) {
                textView.setText(s);
            }
        });
        return root;
    }
}